import 'server-only'
import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { cookies } from 'next/headers'
import { query } from '@/server/db/client'
import type { LoyaltyTier, PublicUser, UserRole } from '@/types/commerce'
import { iso, newId, num } from '@/server/repo/util'
import { SESSION_COOKIE, sessionSecret, signSession, verifySession, type SessionPayload } from '@/server/session-token'

export { SESSION_COOKIE }

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number, opts: object) => Promise<Buffer>

const PRODUCTION = process.env.NODE_ENV === 'production'
const CUSTOMER_SESSION_SECONDS = 30 * 86400
/** Admin sessions are short: a lost or shared device stops being an admin console by the next day. */
const ADMIN_SESSION_SECONDS = 12 * 3600
/** OWASP-recommended scrypt cost (N=2^15, r=8, p=3), ~32 MB per hash. Older hashes are upgraded on sign-in. */
const SCRYPT = { N: 2 ** 15, r: 8, p: 3, keylen: 64 }
const SCRYPT_MAXMEM = 96 * 1024 * 1024
/** The example password once published in .env.example. Never accepted outside development, for any account. */
const EXAMPLE_ADMIN_PASSWORD = 'atelier-dev-2026'

/** True for a password that was published in this repository and must never open an account in production. */
export function isPublishedPassword(password: string): boolean {
  return PRODUCTION && password === EXAMPLE_ADMIN_PASSWORD
}
export const ADMIN_PASSWORD_MIN = 12

/* ─────────────────────────── Passwords ─────────────────────────── */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await scrypt(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: SCRYPT_MAXMEM })
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString('base64')}$${key.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false
  const [, N, r, p, saltB64, keyB64] = parts
  const expected = Buffer.from(keyB64, 'base64')
  const key = await scrypt(password, Buffer.from(saltB64, 'base64'), expected.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: SCRYPT_MAXMEM,
  })
  return key.length === expected.length && timingSafeEqual(key, expected)
}

/** True when a stored hash was made with weaker parameters than today's. */
export function needsRehash(stored: string): boolean {
  const [, N, r, p] = stored.split('$')
  return Number(N) !== SCRYPT.N || Number(r) !== SCRYPT.r || Number(p) !== SCRYPT.p
}

let dummyHash: Promise<string> | null = null

/**
 * Checks a password against a user's hash — or, when there is no such user, against a throwaway
 * hash — so "no account" and "wrong password" take the same time and cannot be told apart.
 */
export async function checkPassword(password: string, stored: string | null): Promise<boolean> {
  if (stored) return verifyPassword(password, stored)
  dummyHash ??= hashPassword(randomBytes(16).toString('hex'))
  await verifyPassword(password, await dummyHash)
  return false
}

/* ─────────────────────────── Sessions ─────────────────────────── */

interface SessionUser {
  id: string
  role: UserRole
  sessionVersion: number
  managedByEnv: boolean
}

export async function startSession(user: SessionUser) {
  const ttl = user.role === 'admin' ? ADMIN_SESSION_SECONDS : CUSTOMER_SESSION_SECONDS
  const env = user.managedByEnv ? envAdmin() : null
  const payload: SessionPayload = {
    sub: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + ttl,
    v: user.sessionVersion,
    ...(env ? { ak: adminKey(env) } : {}),
  }
  const jar = await cookies()
  jar.set(SESSION_COOKIE, signSession(payload), {
    httpOnly: true,
    secure: PRODUCTION,
    sameSite: 'lax',
    path: '/',
    maxAge: ttl,
  })
  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id])
}

export async function endSession() {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, '', { httpOnly: true, secure: PRODUCTION, sameSite: 'lax', path: '/', maxAge: 0 })
}

/** Signs every device out of this account (password change, role change, admin takeover). */
export async function revokeSessions(userId: string): Promise<number> {
  const rows = await query<{ session_version: number }>(
    'UPDATE users SET session_version = session_version + 1 WHERE id = $1 RETURNING session_version',
    [userId]
  )
  return Number(rows[0]?.session_version ?? 0)
}

/* ─────────────────────────── Users ─────────────────────────── */

export function tierFor(points: number): LoyaltyTier {
  if (points >= 3000) return 'tapestry'
  if (points >= 1500) return 'weave'
  if (points >= 500) return 'stitch'
  return 'thread'
}

export function mapUser(r: Record<string, unknown>): PublicUser {
  const points = Math.trunc(num(r.points))
  return {
    id: String(r.id),
    email: String(r.email),
    name: String(r.name),
    role: r.role as UserRole,
    points,
    tier: tierFor(points),
    phone: (r.phone as string | null) ?? null,
    createdAt: iso(r.created_at),
  }
}

/** What startSession needs from a users row. */
export function sessionUser(r: Record<string, unknown>): SessionUser {
  return {
    id: String(r.id),
    role: r.role as UserRole,
    sessionVersion: Math.trunc(num(r.session_version)),
    managedByEnv: r.managed_by_env === true,
  }
}

/**
 * The signed-in user, re-read from the database on every request so that role changes,
 * password changes and admin-credential rotation take effect immediately.
 */
export async function currentUser(): Promise<PublicUser | null> {
  const jar = await cookies()
  const session = verifySession(jar.get(SESSION_COOKIE)?.value)
  if (!session) return null
  const rows = await query('SELECT * FROM users WHERE id = $1', [session.sub])
  const row = rows[0]
  if (!row) return null
  if (Math.trunc(num(row.session_version)) !== session.v) return null
  if (row.managed_by_env === true) {
    const env = envAdmin()
    if (!env || String(row.email).toLowerCase() !== env.email || !safeEqual(session.ak ?? '', adminKey(env))) return null
  }
  return mapUser(row)
}

export async function findUserByEmail(email: string) {
  const rows = await query('SELECT * FROM users WHERE lower(email) = lower($1)', [email.trim()])
  return rows[0] ?? null
}

export async function createUser(input: { name: string; email: string; password: string; role?: UserRole; points?: number }) {
  const rows = await query(
    `INSERT INTO users (id, email, name, password_hash, role, points)
     VALUES ($1, lower($2), $3, $4, $5, $6) RETURNING *`,
    [newId('usr'), input.email.trim(), input.name.trim(), await hashPassword(input.password), input.role ?? 'customer', input.points ?? 0]
  )
  return rows[0]
}

/* ─────────────────────────── Store-owner admin ─────────────────────────── */

interface EnvAdmin {
  email: string
  password: string
}

/** ADMIN_EMAIL / ADMIN_PASSWORD when they are set and strong enough; otherwise null (admin login disabled). */
export function envAdmin(): EnvAdmin | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password || password.length < ADMIN_PASSWORD_MIN) return null
  if (PRODUCTION && password === EXAMPLE_ADMIN_PASSWORD) return null
  return { email, password }
}

export function adminLoginConfigured(): boolean {
  return envAdmin() !== null
}

/** True for the email address reserved for the store owner's admin account. */
export function isEnvAdminEmail(email: string): boolean {
  const env = envAdmin()
  return !!env && email.trim().toLowerCase() === env.email
}

function adminKey(env: EnvAdmin): string {
  return createHmac('sha256', sessionSecret()).update(`env-admin\u0000${env.email}\u0000${env.password}`).digest('base64url').slice(0, 32)
}

function safeEqual(a: string, b: string): boolean {
  const x = createHash('sha256').update(a).digest()
  const y = createHash('sha256').update(b).digest()
  return timingSafeEqual(x, y)
}

/**
 * Signs in the store owner with ADMIN_EMAIL / ADMIN_PASSWORD. On a match the account is
 * created, or an existing row is taken over as the admin account. A takeover (or a new
 * password) revokes every older session for that row, so nobody who registered that email
 * earlier keeps a session that would now carry admin rights.
 */
export async function matchEnvAdmin(email: string, password: string): Promise<{ user: PublicUser; session: SessionUser } | null> {
  const env = envAdmin()
  if (!env || email.trim().toLowerCase() !== env.email) return null
  if (!safeEqual(password, env.password)) return null

  const existing = await findUserByEmail(env.email)
  if (!existing) {
    const created = await createUser({ name: 'Store Admin', email: env.email, password, role: 'admin' })
    const rows = await query('UPDATE users SET managed_by_env = true WHERE id = $1 RETURNING *', [created.id])
    return { user: mapUser(rows[0]), session: sessionUser(rows[0]) }
  }
  const samePassword = !needsRehash(String(existing.password_hash)) && (await verifyPassword(password, String(existing.password_hash)))
  const takeover = existing.managed_by_env !== true || existing.role !== 'admin' || !samePassword
  const rows = await query(
    `UPDATE users
        SET role = 'admin', managed_by_env = true, password_hash = $2,
            session_version = session_version + $3
      WHERE id = $1 RETURNING *`,
    [existing.id, samePassword ? existing.password_hash : await hashPassword(password), takeover ? 1 : 0]
  )
  return { user: mapUser(rows[0]), session: sessionUser(rows[0]) }
}
