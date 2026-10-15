import { getPaymentState } from '@/server/repo/orders'
import { clientIp, HttpError, ok, parseBody, route } from '@/server/http'
import { rateLimit } from '@/server/rate-limit'
import { paymentCancelSchema } from '@/server/validation'
import { reconcileUnpaidOrder } from '@/server/payments'

type Ctx = { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

/**
 * Called by checkout when the customer closes the payment window. Razorpay is asked first, so a
 * payment that did go through still places the order; otherwise the held stock is released at once.
 */
export const POST = route<Ctx>(async (req, { params }) => {
  const input = await parseBody(req, paymentCancelSchema)
  await rateLimit('payment', clientIp(req))
  const { id } = await params
  const state = await getPaymentState({ id })
  if (!state || state.paymentMethod !== 'razorpay' || state.razorpayOrderId !== input.razorpayOrderId) {
    throw new HttpError(404, 'Order not found.')
  }
  const result = await reconcileUnpaidOrder(id, 'closed')
  return ok({ result })
})
