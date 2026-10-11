import { getProductByHandle } from '@/server/repo/products'
import { createReview, findUserReview, getRatingSummary, hasPurchased, listApprovedReviews } from '@/server/repo/reviews'
import { getSettings } from '@/server/repo/settings'
import { invalidate } from '@/server/catalog'
import { HttpError, ok, parseBody, requireUser, route } from '@/server/http'
import { currentUser } from '@/server/auth'
import { reviewSchema } from '@/server/validation'
import { rateLimit } from '@/server/rate-limit'

type Ctx = { params: Promise<{ handle: string }> }

export const dynamic = 'force-dynamic'

export const GET = route<Ctx>(async (_req, { params }) => {
  const { handle } = await params
  const product = await getProductByHandle(handle)
  if (!product) throw new HttpError(404, 'Product not found.')
  const user = await currentUser()
  const [reviews, summary, mine] = await Promise.all([
    listApprovedReviews(product.id),
    getRatingSummary(product.id),
    user ? findUserReview(product.id, user.id) : Promise.resolve(null),
  ])
  return ok({ reviews, summary, mine }, { headers: { 'Cache-Control': 'no-store' } })
})

export const POST = route<Ctx>(async (req, { params }) => {
  const user = await requireUser()
  const { handle } = await params
  const input = await parseBody(req, reviewSchema)
  await rateLimit('review', user.id)
  const product = await getProductByHandle(handle)
  if (!product) throw new HttpError(404, 'Product not found.')
  if (await findUserReview(product.id, user.id)) {
    throw new HttpError(409, 'You have already reviewed this piece. Thank you!')
  }
  const settings = await getSettings()
  const verified = await hasPurchased(product.id, user.id)
  const review = await createReview({
    productId: product.id,
    userId: user.id,
    author: user.name,
    rating: input.rating,
    title: input.title,
    body: input.body,
    fit: input.fit ?? null,
    verified,
    status: settings.reviews.moderation === 'auto' ? 'approved' : 'pending',
  })
  if (review.status === 'approved') invalidate('reviews', 'products')
  return ok({ review }, { status: 201 })
})
