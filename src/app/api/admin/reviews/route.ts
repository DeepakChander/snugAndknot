import { createReceivedReview, listReviewsAdmin } from '@/server/repo/reviews'
import { getProductById } from '@/server/repo/products'
import { reviewReceived } from '@/server/notify-events'
import { invalidate } from '@/server/catalog'
import { guardWrite, HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { receivedReviewSchema } from '@/server/validation'
import type { ReviewStatus } from '@/types/commerce'

export const dynamic = 'force-dynamic'

export const GET = route(async (req) => {
  await requireAdmin()
  const status = new URL(req.url).searchParams.get('status') as ReviewStatus | null
  const valid = status && ['pending', 'approved', 'rejected'].includes(status) ? status : undefined
  return ok({ reviews: await listReviewsAdmin(valid) })
})

/** Adds a real review the owner received off the site, with the customer's agreement. Live at once, never verified. */
export const POST = route(async (req) => {
  guardWrite(req)
  const admin = await requireAdmin()
  const input = await parseBody(req, receivedReviewSchema)
  if (!(await getProductById(input.productId))) throw new HttpError(422, 'That piece does not exist.', { productId: 'Choose a piece' })
  const review = await createReceivedReview(input)
  invalidate('reviews', 'products')
  await reviewReceived(review, admin.email)
  return ok({ review }, { status: 201 })
})
