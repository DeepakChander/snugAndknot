import 'server-only'
import { createHash } from 'node:crypto'
import { query } from '@/server/db/client'
import { HttpError } from '@/server/http'
import { rateLimited } from '@/server/notify-events'

/**
 * Fixed-window limits stored in the database, so every serverless instance shares one
 * counter (an in-memory Map would give each instance its own allowance).
 */
export const LIMITS = {
  loginIp: { limit: 30, windowMs: 15 * 60_000, message: 'Too many sign-in attempts. Please wait 15 minutes and try again.' },
  // One account from one connection: stops guessing without letting a stranger lock the owner out.
  loginAccountIp: { limit: 10, windowMs: 15 * 60_000, message: 'Too many sign-in attempts. Please wait 15 minutes and try again.' },
  // One account from everywhere: a ceiling on distributed guessing, far above anything a person does.
  loginEmail: { limit: 100, windowMs: 15 * 60_000, message: 'Too many sign-in attempts. Please wait 15 minutes and try again.' },
  signup: { limit: 10, windowMs: 60 * 60_000, message: 'Too many sign-ups from this connection. Please try again later.' },
  passwordChange: { limit: 8, windowMs: 15 * 60_000, message: 'Too many attempts. Please wait a few minutes.' },
  order: { limit: 10, windowMs: 60 * 60_000, message: 'Too many orders from this connection. Please try again later.' },
  orderEmail: { limit: 5, windowMs: 60 * 60_000, message: 'Too many orders for this email. Please contact us.' },
  orderLookupIp: { limit: 15, windowMs: 15 * 60_000, message: 'Too many lookups. Please wait a few minutes.' },
  orderLookupEmail: { limit: 10, windowMs: 60 * 60_000, message: 'Too many lookups for this email. Please try again later.' },
  helpful: { limit: 1, windowMs: 24 * 3600_000, message: 'You have already marked this review as helpful.' },
  newsletter: { limit: 10, windowMs: 60 * 60_000, message: 'Too many attempts. Please try again later.' },
  contact: { limit: 5, windowMs: 10 * 60_000, message: 'You have sent several messages already. Please wait a few minutes.' },
  contactDaily: { limit: 20, windowMs: 24 * 3600_000, message: 'You have sent many messages today. Please email us instead.' },
  stockAlert: { limit: 20, windowMs: 60 * 60_000, message: 'Too many requests. Please try again later.' },
  review: { limit: 10, windowMs: 60 * 60_000, message: 'You have posted several reviews already. Please try again later.' },
  returnRequest: { limit: 10, windowMs: 60 * 60_000, message: 'Too many return requests. Please contact us.' },
  quote: { limit: 300, windowMs: 10 * 60_000, message: 'Too many requests. Please slow down.' },
  search: { limit: 300, windowMs: 10 * 60_000, message: 'Too many searches. Please slow down.' },
  upload: { limit: 60, windowMs: 10 * 60_000, message: 'Too many uploads. Please wait a few minutes.' },
} as const

export type LimitName = keyof typeof LIMITS

function hashKey(name: string, id: string) {
  return createHash('sha256').update(`${name}\u0000${id.toLowerCase()}`).digest('base64url')
}

/** Counts one hit against `name` for `id`; throws 429 (with Retry-After) once the window is full. */
const QUIET = new Set<LimitName>(['helpful', 'quote', 'search'] as LimitName[])

export async function rateLimit(name: LimitName, id: string): Promise<void> {
  const { limit, windowMs, message } = LIMITS[name]
  const rows = await query<{ count: number; retry: number }>(
    `INSERT INTO rate_limits (key, count, reset_at)
     VALUES ($1, 1, now() + make_interval(secs => $2))
     ON CONFLICT (key) DO UPDATE SET
       count    = CASE WHEN rate_limits.reset_at <= now() THEN 1 ELSE rate_limits.count + 1 END,
       reset_at = CASE WHEN rate_limits.reset_at <= now() THEN EXCLUDED.reset_at ELSE rate_limits.reset_at END
     RETURNING count, CEIL(EXTRACT(EPOCH FROM (reset_at - now())))::int AS retry`,
    [hashKey(name, id), windowMs / 1000]
  )
  // Occasionally clear out windows that ended long ago so the table stays small.
  if (Math.random() < 0.01) {
    await query(`DELETE FROM rate_limits WHERE reset_at < now() - interval '1 day'`).catch(() => {})
  }
  const { count, retry } = rows[0]
  if (count > limit) {
    // The first refusal in a window tells the support inbox (repeats are collapsed there). Everyday
    // limits such as "helpful" votes, search and cart quotes are not worth an email.
    if (count === limit + 1 && !QUIET.has(name)) await rateLimited(name, hashKey(name, id))
    throw new HttpError(429, message, undefined, { 'Retry-After': String(Math.max(1, retry)) })
  }
}
