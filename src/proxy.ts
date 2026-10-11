import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySession } from '@/server/session-token'

/**
 * First line of defence for the admin area: requests without a validly signed admin session
 * never reach admin pages or admin API code. Each page and route still checks the database
 * itself (revoked sessions, changed roles); this layer only needs the cookie signature.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = verifySession(req.cookies.get(SESSION_COOKIE)?.value)
  const isAdmin = session?.role === 'admin'

  if (pathname.startsWith('/api/admin')) {
    if (isAdmin) return NextResponse.next()
    return NextResponse.json(
      { error: session ? 'This area is for store administrators.' : 'Admin sign-in required.' },
      { status: session ? 403 : 401, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  if (pathname === '/admin/login' || isAdmin) return NextResponse.next()
  const url = req.nextUrl.clone()
  url.pathname = '/admin/login'
  url.search = session ? '?denied=1' : ''
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin', '/api/admin/:path*'],
}
