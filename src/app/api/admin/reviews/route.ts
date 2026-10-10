import { listReviewsAdmin } from '@/server/repo/reviews'
import { ok, requireAdmin, route } from '@/server/http'
import type { ReviewStatus } from '@/types/commerce'

export const dynamic = 'force-dynamic'

export const GET = route(async (req) => {
  await requireAdmin()
  const status = new URL(req.url).searchParams.get('status') as ReviewStatus | null
  const valid = status && ['pending', 'approved', 'rejected'].includes(status) ? status : undefined
  return ok({ reviews: await listReviewsAdmin(valid) })
})
