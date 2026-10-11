import { deleteReview, getReviewById, updateReviewAdmin } from '@/server/repo/reviews'
import { reviewDeleted, reviewUpdated } from '@/server/notify-events'
import { invalidate } from '@/server/catalog'
import { guardWrite, HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { reviewPatchSchema } from '@/server/validation'

type Ctx = { params: Promise<{ id: string }> }

export const PATCH = route<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin()
  const patch = await parseBody(req, reviewPatchSchema)
  const { id } = await params
  const before = await getReviewById(id)
  const review = await updateReviewAdmin(id, patch)
  if (!review) throw new HttpError(404, 'Review not found.')
  invalidate('reviews', 'products')
  if (before) await reviewUpdated(before, review, admin.email)
  return ok({ review })
})

export const DELETE = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  const admin = await requireAdmin()
  const { id } = await params
  const before = await getReviewById(id)
  const deleted = await deleteReview(id)
  if (!deleted) throw new HttpError(404, 'Review not found.')
  invalidate('reviews', 'products')
  if (before) await reviewDeleted(before, admin.email)
  return ok({ ok: true })
})
