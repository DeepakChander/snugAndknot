import { CheckoutError, listOrdersForUser, placeOrder } from '@/server/repo/orders'
import { getSettings } from '@/server/repo/settings'
import { invalidate } from '@/server/catalog'
import { currentUser } from '@/server/auth'
import { clientIp, HttpError, ok, parseBody, requireUser, route } from '@/server/http'
import { rateLimit } from '@/server/rate-limit'
import { orderSchema } from '@/server/validation'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  const user = await requireUser()
  const orders = await listOrdersForUser(user.id)
  return ok({ orders }, { headers: { 'Cache-Control': 'no-store' } })
})

export const POST = route(async (req) => {
  const input = await parseBody(req, orderSchema)
  await rateLimit('order', clientIp(req))
  await rateLimit('orderEmail', input.email)
  const settings = await getSettings()
  if (!settings.commerce.codEnabled) throw new HttpError(400, 'Checkout is temporarily unavailable.')
  const user = await currentUser()
  try {
    const order = await placeOrder({
      lines: input.lines,
      couponCode: input.couponCode ?? null,
      shippingMethod: input.shippingMethod,
      email: input.email,
      address: input.address,
      notes: input.notes ?? null,
      userId: user?.id ?? null,
      paymentMethod: input.paymentMethod,
      commerce: settings.commerce,
    })
    // Inventory changed — product pages must show the new stock.
    invalidate('products')
    return ok({ order }, { status: 201 })
  } catch (err) {
    if (err instanceof CheckoutError) throw new HttpError(err.status, err.message)
    throw err
  }
})
