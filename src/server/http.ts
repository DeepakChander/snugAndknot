import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { currentUser } from './auth'
import type { PublicUser } from '@/types/commerce'

export class HttpError extends Error {
  constructor(public status: number, message: string, public fields?: Record<string, string>) {
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

export async function parseBody<S extends z.ZodType>(req: Request, schema: S): Promise<z.infer<S>> {
  assertSameOrigin(req)
  let raw: unknown
  try {
    raw = await req.json()
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

export function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'local'
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>

/** Wraps a route handler so thrown HttpErrors (and unexpected failures) become JSON responses. */
export function route<C = unknown>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx)
    } catch (err) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message, fields: err.fields }, { status: err.status })
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
