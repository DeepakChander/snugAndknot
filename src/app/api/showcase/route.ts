import { timingSafeEqual } from 'node:crypto'
import { getSettings } from '@/server/repo/settings'
import { HttpError, ok, route } from '@/server/http'
import { SAMPLE_REVIEWS } from '@/lib/showcase'

export const dynamic = 'force-dynamic'

const same = (a: string, b: string) => a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b))

/**
 * The private client showcase: with the secret from Admin → Settings → Home page → Client showcase
 * (and the showcase switched on), the sample reviews for the home page preview. Anything else is a
 * plain 404, so the link cannot be told apart from a page that does not exist.
 */
export const GET = route(async (req) => {
  const token = new URL(req.url).searchParams.get('token')?.trim() ?? ''
  const { showcase } = await getSettings()
  if (!showcase.enabled || !showcase.token || !token || !same(token, showcase.token)) throw new HttpError(404, 'Not found.')
  const day = 86_400_000
  const reviews = SAMPLE_REVIEWS.map((r) => ({ ...r, verified: false, source: 'site' as const, createdAt: new Date(Date.now() - r.daysAgo * day).toISOString() }))
  const average = Math.round((reviews.reduce((n, r) => n + r.rating, 0) / reviews.length) * 10) / 10
  return ok({ reviews, average, count: reviews.length }, { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })
})
