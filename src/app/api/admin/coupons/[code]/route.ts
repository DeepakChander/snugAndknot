import { deleteCoupon, getCoupon, upsertCoupon } from '@/server/repo/coupons'
import { guardWrite, HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { couponSchema } from '@/server/validation'
import { catalogChanged, couponSaved } from '@/server/notify-events'

type Ctx = { params: Promise<{ code: string }> }

export const PUT = route<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin()
  const input = await parseBody(req, couponSchema)
  // Next.js has already decoded the segment; decoding again would throw on a stray %.
  const code = (await params).code
  const before = await getCoupon(code)
  if (!before) throw new HttpError(404, 'Coupon not found.')
  if (input.code.toUpperCase() !== code.toUpperCase()) throw new HttpError(400, 'A coupon code cannot be renamed.')
  const coupon = await upsertCoupon(input)
  await couponSaved('updated', coupon, admin.email, before)
  return ok({ coupon })
})

export const DELETE = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  const admin = await requireAdmin()
  // Next.js has already decoded the segment; decoding again would throw on a stray %.
  const code = (await params).code
  if (!(await deleteCoupon(code))) throw new HttpError(404, 'Coupon not found.')
  await catalogChanged('Discount code', 'deleted', code, admin.email)
  return ok({ ok: true })
})
