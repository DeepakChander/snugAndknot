import { getCoupon, listCoupons, upsertCoupon } from '@/server/repo/coupons'
import { HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { couponSchema } from '@/server/validation'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  await requireAdmin()
  return ok({ coupons: await listCoupons() })
})

export const POST = route(async (req) => {
  await requireAdmin()
  const input = await parseBody(req, couponSchema)
  if (await getCoupon(input.code)) throw new HttpError(409, 'A coupon with this code already exists.')
  return ok({ coupon: await upsertCoupon(input) }, { status: 201 })
})
