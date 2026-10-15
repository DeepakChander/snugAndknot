import { CheckoutError, listOrdersForUser, openCodPieces, placeOrder } from '@/server/repo/orders'
import { getSettings } from '@/server/repo/settings'
import { invalidate } from '@/server/catalog'
import { currentUser } from '@/server/auth'
import { clientIp, HttpError, ok, parseBody, requireUser, route } from '@/server/http'
import { rateLimit } from '@/server/rate-limit'
import { orderSchema } from '@/server/validation'
import { inventoryAfterOrder, orderPlaced } from '@/server/notify-events'
import { onlinePaymentsAvailable, startOnlinePayment, sweepUnpaidOrders } from '@/server/payments'
import { after } from 'next/server'
import { findCurrency } from '@/lib/currency'

export const dynamic = 'force-dynamic'

/** Pieces one email may hold in unconfirmed cash-on-delivery orders. */
const MAX_OPEN_COD_PIECES = 12

export const GET = route(async () => {
  const user = await requireUser()
  const orders = await listOrdersForUser(user.id)
  return ok({ orders }, { headers: { 'Cache-Control': 'no-store' } })
})

export const POST = route(async (req) => {
  const input = await parseBody(req, orderSchema)
  await rateLimit('order', clientIp(req))
  await rateLimit('orderDay', clientIp(req))
  await rateLimit('orderEmail', input.email)
  const settings = await getSettings()
  const online = input.paymentMethod === 'razorpay'
  if (!online && !settings.commerce.codEnabled) throw new HttpError(400, 'Checkout is temporarily unavailable.')
  // Cash on delivery takes stock before anyone pays, so one email cannot hold more than a few
  // pieces in orders the store has not confirmed yet (stops fake orders emptying the shelves).
  if (!online) {
    const held = await openCodPieces(input.email)
    const asked = input.lines.reduce((n, l) => n + l.quantity, 0)
    if (held + asked > MAX_OPEN_COD_PIECES) {
      throw new HttpError(429, `You already have ${held} piece${held === 1 ? '' : 's'} in orders waiting to be confirmed. Please wait for them, or contact us to order more.`)
    }
  }
  if (online && !onlinePaymentsAvailable(settings.commerce)) throw new HttpError(400, 'Online payment is not available right now. Please choose another way to pay.')
  // Never charge in a currency other than the one the shopper saw.
  if (input.currency && !findCurrency(settings.commerce, input.currency)) {
    throw new HttpError(400, `Prices in ${input.currency} are no longer available. Please refresh the page and check your bag.`)
  }
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
      currency: input.currency ?? null,
    })
  } catch (err) {
    if (err instanceof CheckoutError) throw new HttpError(err.status, err.message)
    throw err
  }
  // Inventory changed — product pages must show the new stock.
  invalidate('products')
  if (online) {
    // Held, not placed: the store hears about it once the payment is confirmed.
    const payment = await startOnlinePayment(order, settings.store)
    return ok({ order, payment }, { status: 201 })
  }
  await orderPlaced(order)
  await inventoryAfterOrder(order)
  return ok({ order }, { status: 201 })
})
