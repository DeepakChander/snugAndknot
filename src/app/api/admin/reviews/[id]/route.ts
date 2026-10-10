import { deleteReview, updateReviewAdmin } from '@/server/repo/reviews'
import { invalidate } from '@/server/catalog'
import { guardWrite, HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { reviewPatchSchema } from '@/server/validation'

type Ctx = { params: Promise<{ id: string }> }

export const PATCH = route<Ctx>(async (req, { params }) => {
  await requireAdmin()
  const patch = await parseBody(req, reviewPatchSchema)
  const review = await updateReviewAdmin((await params).id, patch)
  if (!review) throw new HttpError(404, 'Review not found.')
  invalidate('reviews', 'products')
  return ok({ review })
})

export const DELETE = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  await requireAdmin()
  const deleted = await deleteReview((await params).id)
  if (!deleted) throw new HttpError(404, 'Review not found.')
  invalidate('reviews', 'products')
  return ok({ ok: true })
})
