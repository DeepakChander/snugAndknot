import 'server-only'
import { after } from 'next/server'
import { query } from '@/server/db/client'
import { getSettings } from '@/server/repo/settings'
import { newId } from '@/server/repo/util'
import { mailConfig, sendMail } from '@/server/mail'
import { absoluteUrl } from '@/lib/site'

/**
 * Store notifications: one email to the store inbox for each thing that happens in the shop
 * (catalogue of events in ./notify-events). Each notice is written to the `notifications` table
 * first and sent after the response, so checkout and forms never wait on the mail server, and a
 * failed send is retried with a back-off by later notices. Nothing here ever throws into the caller.
 */
export type Field = [label: string, value: string | number | null | undefined]

export interface Section {
  title?: string
  fields?: Field[]
  text?: string
  list?: string[]
}

export interface Notice {
  /** Stable event name, e.g. "order.placed". */
  type: string
  subject: string
  /** One sentence at the top of the email. */
  intro: string
  /** Short flags shown in the subject and as badges, e.g. "First order", "Guest". */
  tags?: string[]
  sections?: Section[]
  /** Link into the admin (a site path). */
  action?: { label: string; path: string }
  /** Replies go to the customer (contact messages, orders). */
  replyTo?: string | null
  /** A second recipient, e.g. the old inbox when the store email is changed. */
  alsoTo?: string | null
  /** Collapse repeats: at most one notice per (type, key) within `minutes`. */
  dedupe?: { key: string; minutes: number }
}

const MAX_ATTEMPTS = 3

/**
 * Events anyone on the internet can trigger. Together they get an hourly ceiling, so a flood of
 * sign-ups or messages cannot use up the mailbox's daily sending allowance and push real order
 * emails out. Notices over it are logged as suppressed, not sent. Orders, returns and admin
 * actions are never capped.
 */
const PUBLIC_TYPES = [
  'stock_alert.requested',
  'newsletter.subscribed',
  'customer.signed_up',
  'customer.signed_in',
  'customer.login_failed',
  'contact.message',
  'review.pending',
  'review.published',
  'order.lookup',
  'order.lookup_failed',
  'security.admin_login_failed',
]
const RATE_LIMITED = 'security.rate_limited.'
const HOURLY_CAP_PER_TYPE = 30
const HOURLY_CAP_PUBLIC = 120
const isPublic = (type: string) => PUBLIC_TYPES.includes(type) || type.startsWith(RATE_LIMITED)

const clean = (s: string) => s.replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').trim()
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const shown = (v: Field[1]) => (v === null || v === undefined || v === '' ? '—' : String(v))

/** The inbox notices go to: NOTIFY_EMAIL, else the Gmail account that sends them, else the store email. */
export function notifyRecipient(storeEmail: string): string {
  return process.env.NOTIFY_EMAIL?.trim() || mailConfig()?.inbox || storeEmail
}

export function render(n: Notice, storeName = 'Snug&Knot'): { subject: string; text: string; html: string } {
  const tagText = n.tags?.length ? `${n.tags.map((t) => `[${t}]`).join(' ')} ` : ''
  const subject = clean(`[${storeName}] ${tagText}${n.subject}`).slice(0, 220)

  const text: string[] = [n.intro, '']
  for (const s of n.sections ?? []) {
    if (s.title) text.push(s.title.toUpperCase())
    for (const [k, v] of s.fields ?? []) text.push(`${k}: ${shown(v)}`)
    if (s.text) text.push(s.text)
    for (const item of s.list ?? []) text.push(`- ${item}`)
    text.push('')
  }
  if (n.action) text.push(`${n.action.label}: ${absoluteUrl(n.action.path)}`)
  text.push('', `Event: ${n.type} · ${new Date().toISOString()}`)

  const badge = (t: string) =>
    `<span style="display:inline-block;margin:0 6px 6px 0;padding:3px 9px;border-radius:999px;background:#d9442b;color:#f7f5f0;font:600 11px/1.4 Arial,sans-serif;letter-spacing:.04em;text-transform:uppercase">${esc(t)}</span>`
  const sections = (n.sections ?? [])
    .map((s) => {
      const title = s.title ? `<h3 style="margin:22px 0 8px;font:600 12px/1.3 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#66625b">${esc(s.title)}</h3>` : ''
      const rows = (s.fields ?? [])
        .map(([k, v]) => `<tr><td style="padding:5px 12px 5px 0;color:#66625b;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:5px 0;color:#161513">${esc(shown(v))}</td></tr>`)
        .join('')
      const table = rows ? `<table role="presentation" style="border-collapse:collapse;font:14px/1.5 Arial,sans-serif">${rows}</table>` : ''
      const para = s.text ? `<p style="margin:8px 0;font:14px/1.6 Arial,sans-serif;color:#161513;white-space:pre-wrap">${esc(s.text)}</p>` : ''
      const list = s.list?.length ? `<ul style="margin:6px 0;padding-left:18px;font:14px/1.6 Arial,sans-serif;color:#161513">${s.list.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>` : ''
      return title + table + para + list
    })
    .join('')
  const action = n.action
    ? `<p style="margin:26px 0 0"><a href="${esc(absoluteUrl(n.action.path))}" style="display:inline-block;padding:11px 20px;border-radius:999px;background:#161513;color:#f7f5f0;text-decoration:none;font:600 13px/1 Arial,sans-serif">${esc(n.action.label)} →</a></p>`
    : ''
  const html = `<!doctype html><html><body style="margin:0;background:#eeebe4;padding:24px">
<div style="max-width:620px;margin:0 auto;background:#f7f5f0;border-radius:16px;overflow:hidden">
<div style="background:#161513;padding:16px 24px;color:#f7f5f0;font:700 14px/1 Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase">${esc(storeName)} <span style="color:#d9442b">✦</span> Store notice</div>
<div style="padding:24px">
${n.tags?.length ? `<div>${n.tags.map(badge).join('')}</div>` : ''}
<h2 style="margin:6px 0 10px;font:700 22px/1.2 Arial,sans-serif;color:#161513">${esc(n.subject)}</h2>
<p style="margin:0;font:15px/1.6 Arial,sans-serif;color:#161513">${esc(n.intro)}</p>
${sections}${action}
<p style="margin:28px 0 0;font:11px/1.5 Arial,sans-serif;color:#9a958b">${esc(n.type)} · ${esc(new Date().toUTCString())}</p>
</div></div></body></html>`
  return { subject, text: text.join('\n'), html }
}

/**
 * Sends one recorded notice. The claim is a single UPDATE, so two instances never send the same row;
 * a claim older than 10 minutes counts as abandoned (the instance died mid-send) and may be retaken.
 */
async function deliver(id: string): Promise<void> {
  const [row] = await query<{ to_email: string; subject: string; body_text: string; body_html: string; reply_to: string | null }>(
    `UPDATE notifications SET status = 'sending', attempts = attempts + 1, claimed_at = now()
      WHERE id = $1 AND attempts < $2
        AND (status = 'pending'
          OR (status = 'failed' AND (next_attempt_at IS NULL OR next_attempt_at <= now()))
          OR (status = 'sending' AND claimed_at < now() - interval '10 minutes'))
      RETURNING to_email, subject, body_text, body_html, reply_to`,
    [id, MAX_ATTEMPTS]
  )
  if (!row) return
  let sent: boolean
  try {
    sent = await sendMail({ to: row.to_email, subject: row.subject, text: row.body_text, html: row.body_html, replyTo: row.reply_to })
  } catch (err) {
    const message = String((err as Error)?.message ?? err).slice(0, 500)
    // Back off, so a short outage cannot use up every attempt: the next try waits 5 minutes, the last an hour.
    await query(
      `UPDATE notifications SET status = 'failed', error = $2,
              next_attempt_at = now() + CASE WHEN attempts <= 1 THEN interval '5 minutes' ELSE interval '1 hour' END
        WHERE id = $1`,
      [id, message]
    )
    console.error('[notify] send failed', id, message)
    return
  }
  // The message is out (or mail is not set up). Never mark it failed from here, or it would be sent
  // again. The stored copy is no longer needed, so the customer details in it are dropped.
  const done = sent
    ? `UPDATE notifications SET status = 'sent', sent_at = now(), error = NULL, body_text = '', body_html = '' WHERE id = $1`
    : `UPDATE notifications SET status = 'skipped', error = 'Mail is not set up', body_text = '', body_html = '' WHERE id = $1`
  for (let attempt = 1; ; attempt++) {
    try {
      await query(done, [id])
      return
    } catch (err) {
      if (attempt >= 3) {
        console.error('[notify] sent, but could not record it', id, err)
        return
      }
    }
  }
}

/** After each notice: retry what is due, close out rows that can no longer be sent, trim old ones. */
async function housekeeping(): Promise<void> {
  await query(
    `UPDATE notifications SET status = 'failed', error = coalesce(error, 'Interrupted before it finished; it may not have been sent')
      WHERE (status = 'sending' AND claimed_at < now() - interval '10 minutes' AND attempts >= $1)
         OR (status IN ('pending', 'sending') AND created_at <= now() - interval '2 days')`,
    [MAX_ATTEMPTS]
  )
  const due = await query<{ id: string }>(
    `SELECT id FROM notifications
      WHERE attempts < $1 AND created_at > now() - interval '2 days'
        AND ((status = 'failed' AND (next_attempt_at IS NULL OR next_attempt_at <= now()))
          OR (status = 'pending' AND created_at < now() - interval '2 minutes')
          OR (status = 'sending' AND claimed_at < now() - interval '10 minutes'))
      ORDER BY created_at LIMIT 5`,
    [MAX_ATTEMPTS]
  )
  for (const r of due) await deliver(r.id)
  // Stored copies hold customer details: bodies go once nothing will send them, rows after 90 days.
  await query(`UPDATE notifications SET body_text = '', body_html = '' WHERE body_text <> '' AND created_at < now() - interval '2 days'`)
  await query(`DELETE FROM notifications WHERE created_at < now() - interval '90 days'`)
}

/** Schedules work after the response; outside a request (scripts, tests) it simply runs. */
function later(job: () => Promise<void>) {
  const safe = () => job().catch((err) => console.error('[notify] background job failed', err))
  try {
    after(safe)
  } catch {
    void safe()
  }
}

async function overHourlyCap(type: string): Promise<boolean> {
  const [c] = await query<{ same: number; total: number }>(
    `SELECT count(*) FILTER (WHERE type = $1)::int AS same, count(*)::int AS total
       FROM notifications
      WHERE created_at > now() - interval '1 hour' AND status <> 'suppressed'
        AND (type = ANY($2::text[]) OR starts_with(type, $3))`,
    [type, PUBLIC_TYPES, RATE_LIMITED]
  )
  return Number(c.same) >= HOURLY_CAP_PER_TYPE || Number(c.total) >= HOURLY_CAP_PUBLIC
}

/**
 * Records a notice and sends it after the response. Never throws: a notification problem must not
 * turn a placed order or a saved form into an error for the customer.
 */
export async function notify(n: Notice): Promise<void> {
  try {
    if (n.dedupe) {
      // A sliding window for the usual case; the unique (type, dedupe_slot) below also collapses
      // repeats that arrive at the same moment.
      const recent = await query(
        `SELECT 1 FROM notifications WHERE type = $1 AND dedupe_key = $2 AND created_at > now() - make_interval(mins => $3) LIMIT 1`,
        [n.type, n.dedupe.key, n.dedupe.minutes]
      )
      if (recent.length) return
    }
    const slot = n.dedupe ? `${n.dedupe.key}|${Math.floor(Date.now() / (n.dedupe.minutes * 60_000))}` : null
    const suppressed = isPublic(n.type) && (await overHourlyCap(n.type))
    const settings = await getSettings()
    const { subject, text, html } = render(n, settings.store.name)
    const to = [...new Set([notifyRecipient(settings.store.email), n.alsoTo?.trim()].filter((v): v is string => !!v))].join(', ')
    const id = newId('ntf')
    const inserted = await query(
      `INSERT INTO notifications (id, type, subject, body_text, body_html, to_email, reply_to, dedupe_key, dedupe_slot, status, error)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT DO NOTHING RETURNING id`,
      [
        id,
        n.type,
        subject,
        suppressed ? '' : text,
        suppressed ? '' : html,
        to,
        n.replyTo ?? null,
        n.dedupe?.key ?? null,
        slot,
        suppressed ? 'suppressed' : 'pending',
        suppressed ? 'Hourly limit for emails the public can trigger was reached' : null,
      ]
    )
    if (!inserted.length) return
    if (suppressed) {
      await notify({
        type: 'system.notices_suppressed',
        subject: 'Some emails are being held back this hour',
        intro: `Visitors triggered more emails than the hourly limit allows (${HOURLY_CAP_PER_TYPE} of one kind, ${HOURLY_CAP_PUBLIC} in all) — often a sign of spam. The rest are listed on the Emails page but not sent. Orders, returns and admin events are never held back.`,
        tags: ['Security'],
        dedupe: { key: 'hourly', minutes: 60 },
        sections: [{ fields: [['First held back', n.type], ['When', new Date().toUTCString()]] }],
        action: { label: 'Open the email log', path: '/admin/emails' },
      })
      return
    }
    later(async () => {
      await deliver(id).catch((err) => console.error('[notify] deliver failed', id, err))
      await housekeeping()
    })
  } catch (err) {
    console.error('[notify] could not record notice', n.type, err)
  }
}
