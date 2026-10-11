import 'server-only'
import nodemailer, { type Transporter } from 'nodemailer'

/**
 * Outgoing mail, configured entirely from the environment. Two ways to send:
 *
 * 1. A Gmail account through the Gmail API (send-only access, nothing can read the mailbox):
 *      GMAIL_USER, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN
 *    (an OAuth client of type "Web application" and a refresh token for the
 *    https://www.googleapis.com/auth/gmail.send scope — see README).
 * 2. Any SMTP mailbox (Hostinger, Zoho, Google Workspace, Resend's relay…):
 *      SMTP_HOST, SMTP_PORT (465 = TLS, 587 = STARTTLS), SMTP_USER, SMTP_PASS
 *
 * Gmail wins when both are set. MAIL_FROM optionally overrides the sender ("Snug&Knot <address>").
 * When neither is set, nothing is sent and callers record the message as skipped.
 */
interface GmailConfig {
  kind: 'gmail'
  user: string
  clientId: string
  clientSecret: string
  refreshToken: string
  from: string
  /** Where store notices go unless NOTIFY_EMAIL says otherwise. */
  inbox: string
  /** How the admin describes the connection. */
  label: string
}

interface SmtpConfig {
  kind: 'smtp'
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
  from: string
  inbox: null
  label: string
}

export type MailConfig = GmailConfig | SmtpConfig

export function mailConfig(): MailConfig | null {
  const env = process.env
  const gmail = {
    user: env.GMAIL_USER?.trim(),
    clientId: env.GMAIL_CLIENT_ID?.trim(),
    clientSecret: env.GMAIL_CLIENT_SECRET?.trim(),
    refreshToken: env.GMAIL_REFRESH_TOKEN?.trim(),
  }
  if (gmail.user && gmail.clientId && gmail.clientSecret && gmail.refreshToken) {
    return {
      kind: 'gmail',
      user: gmail.user,
      clientId: gmail.clientId,
      clientSecret: gmail.clientSecret,
      refreshToken: gmail.refreshToken,
      from: env.MAIL_FROM?.trim() || `Snug&Knot <${gmail.user}>`,
      inbox: gmail.user,
      label: `Gmail API (${gmail.user})`,
    }
  }
  const host = env.SMTP_HOST?.trim()
  const user = env.SMTP_USER?.trim()
  const pass = env.SMTP_PASS
  if (!host || !user || !pass) return null
  const port = Number(env.SMTP_PORT || 465)
  const secure = env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465
  return { kind: 'smtp', host, port, secure, user, pass, from: env.MAIL_FROM?.trim() || `Snug&Knot <${user}>`, inbox: null, label: `${host}:${port}` }
}

export interface OutgoingMail {
  to: string
  subject: string
  text: string
  html: string
  replyTo?: string | null
}

/* ───────────────────────── SMTP ───────────────────────── */

let cached: { key: string; transport: Transporter } | null = null

function smtpTransport(cfg: SmtpConfig): Transporter {
  const key = `${cfg.host}|${cfg.port}|${cfg.secure}|${cfg.user}`
  if (cached?.key === key) return cached.transport
  const t = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    // A slow mail server must never hold a serverless function for long.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    // Only for a local test inbox without TLS; production servers always negotiate TLS.
    ...(process.env.SMTP_IGNORE_TLS === 'true' ? { ignoreTLS: true } : { requireTLS: !cfg.secure }),
  })
  cached = { key, transport: t }
  return t
}

/* ───────────────────────── Gmail API ───────────────────────── */

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GMAIL_SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'

let accessToken: { key: string; value: string; expires: number } | null = null

/** Trades the long-lived refresh token for a short-lived access token, reusing it until it nearly expires. */
async function gmailAccessToken(cfg: GmailConfig): Promise<string> {
  const key = `${cfg.clientId}|${cfg.user}`
  if (accessToken?.key === key && accessToken.expires > Date.now() + 60_000) return accessToken.value
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: cfg.clientId, client_secret: cfg.clientSecret, refresh_token: cfg.refreshToken, grant_type: 'refresh_token' }),
    signal: AbortSignal.timeout(10_000),
  })
  const data = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: string; error_description?: string }
  if (!res.ok || !data.access_token) {
    const why = `${data.error ?? `HTTP ${res.status}`}${data.error_description ? `: ${data.error_description}` : ''}`
    const fix = data.error === 'invalid_grant' ? 'Create a new refresh token and update GMAIL_REFRESH_TOKEN.' : 'Check GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET.'
    throw new Error(`Google refused the Gmail sign-in (${why}). ${fix}`)
  }
  accessToken = { key, value: data.access_token, expires: Date.now() + Number(data.expires_in ?? 3600) * 1000 }
  return accessToken.value
}

/** Builds the MIME message locally (nodemailer, no network) for the Gmail API's `raw` field. */
const composer = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: 'windows' })

async function sendWithGmail(cfg: GmailConfig, msg: OutgoingMail): Promise<void> {
  const info = await composer.sendMail({
    from: cfg.from,
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    html: msg.html,
    ...(msg.replyTo ? { replyTo: msg.replyTo } : {}),
  })
  const raw = Buffer.from(info.message as Buffer).toString('base64url')
  const post = async (token: string) =>
    fetch(GMAIL_SEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw }),
      signal: AbortSignal.timeout(20_000),
    })
  let res = await post(await gmailAccessToken(cfg))
  if (res.status === 401) {
    // The cached access token was revoked or expired early: fetch a fresh one once.
    accessToken = null
    res = await post(await gmailAccessToken(cfg))
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null
    throw new Error(`Gmail did not send the message (HTTP ${res.status}${body?.error?.message ? `: ${body.error.message}` : ''}).`)
  }
}

/* ───────────────────────── Sending ───────────────────────── */

/** Sends one message. Returns false when mail is not configured; throws when it could not be sent. */
export async function sendMail(msg: OutgoingMail): Promise<boolean> {
  const cfg = mailConfig()
  if (!cfg) return false
  if (cfg.kind === 'gmail') {
    await sendWithGmail(cfg, msg)
    return true
  }
  await smtpTransport(cfg).sendMail({
    from: cfg.from,
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    html: msg.html,
    ...(msg.replyTo ? { replyTo: msg.replyTo } : {}),
  })
  return true
}
