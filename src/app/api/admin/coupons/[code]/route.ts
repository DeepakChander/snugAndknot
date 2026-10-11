import { deleteCoupon, getCoupon, upsertCoupon } from '@/server/repo/coupons'
import { guardWrite, HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { couponSchema } from '@/server/validation'

type Ctx = { params: Promise<{ code: string }> }

export const PUT = route<Ctx>(async (req, { params }) => {
  await requireAdmin()
  const input = await parseBody(req, couponSchema)
  const code = decodeURIComponent((await params).code)
  if (!(await getCoupon(code))) throw new HttpError(404, 'Coupon not found.')
  if (input.code.toUpperCase() !== code.toUpperCase()) throw new HttpError(400, 'A coupon code cannot be renamed.')
  return ok({ coupon: await upsertCoupon(input) })
})

export const DELETE = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  await requireAdmin()
  if (!(await deleteCoupon(decodeURIComponent((await params).code)))) throw new HttpError(404, 'Coupon not found.')
  return ok({ ok: true })
})
