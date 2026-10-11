import { getCoupon, listCoupons, upsertCoupon } from '@/server/repo/coupons'
import { HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { couponSchema } from '@/server/validation'
import { couponSaved } from '@/server/notify-events'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  await requireAdmin()
  return ok({ coupons: await listCoupons() })
})

export const POST = route(async (req) => {
  const admin = await requireAdmin()
  const input = await parseBody(req, couponSchema)
  if (await getCoupon(input.code)) throw new HttpError(409, 'A coupon with this code already exists.')
  const coupon = await upsertCoupon(input)
  await couponSaved('created', coupon, admin.email)
  return ok({ coupon }, { status: 201 })
})
