import { CheckoutError, listOrdersForUser, placeOrder } from '@/server/repo/orders'
import { getSettings } from '@/server/repo/settings'
import { invalidate } from '@/server/catalog'
import { currentUser } from '@/server/auth'
import { clientIp, HttpError, ok, parseBody, requireUser, route } from '@/server/http'
import { rateLimit } from '@/server/rate-limit'
import { orderSchema } from '@/server/validation'
import { inventoryAfterOrder, orderPlaced } from '@/server/notify-events'
import { onlinePaymentsAvailable, startOnlinePayment, sweepUnpaidOrders } from '@/server/payments'
import { after } from 'next/server'

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
  const online = input.paymentMethod === 'razorpay'
  if (!online && !settings.commerce.codEnabled) throw new HttpError(400, 'Checkout is temporarily unavailable.')
  if (online && !onlinePaymentsAvailable(settings.commerce)) throw new HttpError(400, 'Online payment is not available right now. Please choose another way to pay.')
  // Expired holds from abandoned online checkouts go back on sale.
  after(sweepUnpaidOrders)
  const user = await currentUser()
  let order
  try {
    order = await placeOrder({
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
  } catch (err) {
    if (err instanceof CheckoutError) throw new HttpError(err.status, err.message)
    throw err
  }
  // Inventory changed — product pages must show the new stock.
  invalidate('products')
  if (online) {
    // Held, not placed: the store hears about it once the payment is confirmed.
    const payment = await startOnlinePayment(order, settings.commerce, settings.store)
    return ok({ order, payment }, { status: 201 })
  }
  await orderPlaced(order)
  await inventoryAfterOrder(order)
  return ok({ order }, { status: 201 })
})
