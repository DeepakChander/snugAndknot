import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { UserRole } from '@/types/commerce'
import { databaseUrl } from './db/url'

/*
 * Session cookie signing. Kept free of database and Next.js imports so that proxy.ts can
 * verify a cookie before any page or API code runs.
 */

const PRODUCTION = process.env.NODE_ENV === 'production'
/** `__Host-` cookies are only accepted over HTTPS, for this exact host, on every path: no subdomain can plant or read one. */
export const SESSION_COOKIE = PRODUCTION ? '__Host-sk_session' : 'sk_session'

export interface SessionPayload {
  sub: string
  role: UserRole
  exp: number
  /** users.session_version when the session was issued. */
  v: number
  /** For the env-managed admin: a fingerprint of ADMIN_EMAIL + ADMIN_PASSWORD at sign-in. */
  ak?: string
}

let processSecret: Buffer | null = null
let warned = false

/**
 * AUTH_SECRET when configured. Otherwise a key derived from DATABASE_URL (already a secret,
 * and identical on every serverless instance), and as a last resort a random per-process key —
 * sessions then only survive within one instance (demo mode).
 */
export function sessionSecret(): Buffer {
  const configured = process.env.AUTH_SECRET
  if (configured) {
    if (configured.length < 32) {
      throw new Error('AUTH_SECRET must be at least 32 characters. Generate one with: openssl rand -base64 32')
    }
    return Buffer.from(configured)
  }
  if (PRODUCTION && !warned) {
    warned = true
    console.warn('[auth] AUTH_SECRET is not set; deriving the session key from the database URL. Set AUTH_SECRET.')
  }
  const db = databaseUrl()?.url || process.env.POSTGRES_URL
  if (db) return createHash('sha256').update(`snugknot-session:${db}`).digest()
  if (!processSecret) processSecret = randomBytes(32)
  return processSecret
}

export function signSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', sessionSecret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

/** The payload of a correctly signed, unexpired cookie — or null. Says nothing about the database. */
export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token || token.length > 4096) return null
  const [body, sig, extra] = token.split('.')
  if (!body || !sig || extra !== undefined) return null
  const expected = createHmac('sha256', sessionSecret()).update(body).digest()
  const given = Buffer.from(sig, 'base64url')
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload
    if (typeof payload.sub !== 'string' || typeof payload.exp !== 'number' || typeof payload.v !== 'number') return null
    if (payload.exp < Date.now() / 1000) return null
    return payload
  } catch {
    return null
  }
}
