import 'server-only'
import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { cookies } from 'next/headers'
import { query } from '@/server/db/client'
import type { LoyaltyTier, PublicUser, UserRole } from '@/types/commerce'
import { iso, newId, num } from '@/server/repo/util'

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, keylen: number, opts: object) => Promise<Buffer>

export const SESSION_COOKIE = 'sk_session'
const SESSION_DAYS = 30
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 }

/* ─────────────────────────── Passwords ─────────────────────────── */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await scrypt(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: 64 * 1024 * 1024 })
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
    maxmem: 64 * 1024 * 1024,
  })
  return key.length === expected.length && timingSafeEqual(key, expected)
}

/* ─────────────────────────── Sessions ─────────────────────────── */

let processSecret: Buffer | null = null

/**
 * AUTH_SECRET when configured. Otherwise a key derived from DATABASE_URL (already a
 * secret, and identical on every serverless instance), and as a last resort a random
 * per-process key — sessions then only survive within one instance (demo mode).
 */
function secret(): Buffer {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16) return Buffer.from(process.env.AUTH_SECRET)
  const db = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (db) return createHash('sha256').update(`snugknot-session:${db}`).digest()
  if (!processSecret) processSecret = randomBytes(32)
  return processSecret
}

interface SessionPayload {
  sub: string
  role: UserRole
  exp: number
}

function b64url(buf: Buffer | string) {
  return Buffer.from(buf).toString('base64url')
}

export function signSession(payload: SessionPayload): string {
  const body = b64url(JSON.stringify(payload))
  const sig = createHmac('sha256', secret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifySession(token: string | undefined): SessionPayload | null {
  if (!token) return null
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', secret()).update(body).digest()
  const given = Buffer.from(sig, 'base64url')
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload
    if (typeof payload.sub !== 'string' || typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) return null
    return payload
  } catch {
    return null
  }
}

export async function startSession(user: { id: string; role: UserRole }) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400
  const jar = await cookies()
  jar.set(SESSION_COOKIE, signSession({ sub: user.id, role: user.role, exp }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 86400,
  })
  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id])
}

export async function endSession() {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 })
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

/** The signed-in user, re-read from the database (so role changes apply immediately). */
export async function currentUser(): Promise<PublicUser | null> {
  const jar = await cookies()
  const session = verifySession(jar.get(SESSION_COOKIE)?.value)
  if (!session) return null
  const rows = await query('SELECT * FROM users WHERE id = $1', [session.sub])
  return rows[0] ? mapUser(rows[0]) : null
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
  return mapUser(rows[0])
}

/**
 * The store owner signs in with ADMIN_EMAIL / ADMIN_PASSWORD from the environment.
 * On a match we upsert that account as an admin, so no manual database step is needed
 * and rotating the env password rotates the admin password.
 */
export async function matchEnvAdmin(email: string, password: string): Promise<PublicUser | null> {
  const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
  const envPassword = process.env.ADMIN_PASSWORD
  if (!envEmail || !envPassword || envPassword.length < 8) return null
  if (email.trim().toLowerCase() !== envEmail) return null
  const a = createHash('sha256').update(password).digest()
  const b = createHash('sha256').update(envPassword).digest()
  if (!timingSafeEqual(a, b)) return null

  const existing = await findUserByEmail(envEmail)
  if (!existing) return createUser({ name: 'Store Admin', email: envEmail, password, role: 'admin' })
  const rows = await query(
    `UPDATE users SET role = 'admin', password_hash = $2 WHERE id = $1 RETURNING *`,
    [existing.id, (await verifyPassword(password, String(existing.password_hash))) ? existing.password_hash : await hashPassword(password)]
  )
  return mapUser(rows[0])
}

export function adminLoginConfigured(): boolean {
  return !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 8)
}

/* ─────────────────────────── Throttling ─────────────────────────── */

const attempts = new Map<string, { count: number; first: number }>()

/** Best-effort, per-instance brute-force guard for credential endpoints. */
export function throttle(key: string, limit = 10, windowMs = 15 * 60_000): boolean {
  const now = Date.now()
  const entry = attempts.get(key)
  if (!entry || now - entry.first > windowMs) {
    attempts.set(key, { count: 1, first: now })
    return true
  }
  entry.count += 1
  return entry.count <= limit
}
