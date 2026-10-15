import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { currentUser } from './auth'
import type { PublicUser } from '@/types/commerce'

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields?: Record<string, string>,
    public headers?: Record<string, string>
  ) {
    super(message)
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init)
}

/**
 * Reject cross-site writes. Browsers always send Origin on POST/PATCH/DELETE; when it is
 * present it must match the host serving the request.
 */
function assertSameOrigin(req: Request) {
  // Browsers label every request with where it came from; a cross-site write is never ours.
  if (req.headers.get('sec-fetch-site') === 'cross-site') throw new HttpError(403, 'Cross-site request blocked.')
  const origin = req.headers.get('origin')
  if (!origin) return
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  try {
    if (new URL(origin).host !== host) throw new HttpError(403, 'Cross-site request blocked.')
  } catch (e) {
    if (e instanceof HttpError) throw e
    throw new HttpError(403, 'Cross-site request blocked.')
  }
}

const MAX_JSON_BYTES = 1_000_000

export async function parseBody<S extends z.ZodType>(req: Request, schema: S): Promise<z.infer<S>> {
  assertSameOrigin(req)
  // Only JSON bodies: an HTML form (the classic CSRF vehicle) cannot send this content type.
  const mediaType = req.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
  if (mediaType !== 'application/json') {
    throw new HttpError(415, 'Request body must be JSON.')
  }
  if (Number(req.headers.get('content-length') ?? 0) > MAX_JSON_BYTES) throw new HttpError(413, 'Request is too large.')
  const text = await req.text()
  if (text.length > MAX_JSON_BYTES) throw new HttpError(413, 'Request is too large.')
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new HttpError(400, 'Request body must be JSON.')
  }
  const result = schema.safeParse(raw)
  if (!result.success) {
    const fields: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_'
      if (!fields[key]) fields[key] = issue.message
    }
    const first = result.error.issues[0]
    throw new HttpError(422, first ? `${first.path.join('.') || 'Input'}: ${first.message}` : 'Invalid input.', fields)
  }
  return result.data
}

export function guardWrite(req: Request) {
  assertSameOrigin(req)
}

export async function requireUser(): Promise<PublicUser> {
  const user = await currentUser()
  if (!user) throw new HttpError(401, 'Please sign in to continue.')
  return user
}

export async function requireAdmin(): Promise<PublicUser> {
  const user = await currentUser()
  if (!user) throw new HttpError(401, 'Admin sign-in required.')
  if (user.role !== 'admin') throw new HttpError(403, 'This area is for store administrators.')
  return user
}

/**
 * The visitor's IP for rate limiting. On Vercel both headers are written by the platform
 * (client-sent values are replaced), so they cannot be spoofed to dodge limits.
 */
export function clientIp(req: Request): string {
  const ip = req.headers.get('x-real-ip')?.trim() || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  return ipv6Network(ip) ?? ip
}

/**
 * An IPv6 address as its /64 network ("2001:db8:1:2::/64"): one home or phone connection gets a whole
 * /64 and can rotate through it freely, so limits must count the network, not each address.
 */
function ipv6Network(ip: string): string | null {
  if (!ip.includes(':') || ip.includes('.')) return null
  const [head, tail = ''] = ip.toLowerCase().split('::')
  const left = head ? head.split(':') : []
  const right = tail ? tail.split(':') : []
  if (left.length + right.length > 8) return null
  const full = [...left, ...Array(8 - left.length - right.length).fill('0'), ...right]
  return `${full.slice(0, 4).map((h) => h.replace(/^0+(?=.)/, '')).join(':')}::/64`
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>

/** Wraps a route handler so thrown HttpErrors (and unexpected failures) become JSON responses. */
export function route<C = unknown>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      const res = await handler(req, ctx)
      // API responses can carry personal data: never let a browser or CDN cache them.
      if (!res.headers.has('Cache-Control')) res.headers.set('Cache-Control', 'no-store')
      return res
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message, fields: err.fields }, { status: err.status, headers: { 'Cache-Control': 'no-store', ...err.headers } })
      }
      const status = (err as { status?: number }).status
      if (typeof status === 'number' && status >= 400 && status < 500) {
        return NextResponse.json({ error: (err as Error).message }, { status })
      }
      console.error('[api]', req.method, new URL(req.url).pathname, err)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }
  }
}
