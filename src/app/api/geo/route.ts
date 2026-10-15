import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * The visitor's country, so the storefront can show the right currency first. On Vercel the
 * platform sets x-vercel-ip-country; elsewhere the answer is "ZZ" (unknown) and the base currency
 * is used. Nothing is stored on the server.
 */
export function GET(req: Request) {
  const raw = req.headers.get('x-vercel-ip-country')?.trim().toUpperCase() ?? ''
  const country = /^[A-Z]{2}$/.test(raw) ? raw : 'ZZ'
  return NextResponse.json({ country }, { headers: { 'Cache-Control': 'private, no-store' } })
}
