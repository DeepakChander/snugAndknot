import { after } from 'next/server'
import { getOrderById } from '@/server/repo/orders'
import { clientIp, HttpError, ok, parseBody, route } from '@/server/http'
import { rateLimit } from '@/server/rate-limit'
import { paymentConfirmSchema } from '@/server/validation'
import { announce, confirmFromCheckout } from '@/server/payments'

type Ctx = { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

/**
 * Called by checkout when Razorpay reports success. The signature is checked against the Razorpay
 * order this server created, and the payment is read back from Razorpay before the order is placed.
 * `confirmed: false` means the payment is still being confirmed (the webhook or sweep will finish),
 * unless `refundDue` says it arrived too late to fill the order.
 */
export const POST = route<Ctx>(async (req, { params }) => {
  const input = await parseBody(req, paymentConfirmSchema)
  await rateLimit('payment', clientIp(req))
  const { id } = await params
  const settlement = await confirmFromCheckout(id, input)
  after(() => announce(settlement))
  const order = await getOrderById(id)
  if (!order) throw new HttpError(404, 'Order not found.')
  const confirmed = settlement.kind === 'paid' && order.status !== 'cancelled'
  // Paid after the hold ran out and the pieces sold out meanwhile: the store refunds it.
  const refundDue = settlement.kind === 'paid' && settlement.outcome === 'paid-after-cancel'
  return ok({ order, confirmed, refundDue })
})
