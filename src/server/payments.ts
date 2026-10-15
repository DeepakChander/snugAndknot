import 'server-only'
import { invalidate } from '@/server/catalog'
import { HttpError } from '@/server/http'
import {
  getOrderById,
  getPaymentState,
  listStaleUnpaidOrders,
  markOrderPaid,
  releaseUnpaidOrder,
  setRazorpayOrderId,
  type PaidOutcome,
} from '@/server/repo/orders'
import {
  capturePayment,
  createRazorpayOrder,
  fetchOrderPayments,
  fetchPayment,
  razorpayConfig,
  RazorpayError,
  toSubunits,
  verifyPaymentSignature,
  type RazorpayConfig,
  type RazorpayPayment,
} from '@/server/razorpay'
import { checkoutAbandoned, inventoryAfterOrder, latePayment, orderPlaced, paymentMismatch } from '@/server/notify-events'
import type { Order, StoreSettings } from '@/types/commerce'

/**
 * Online payments, end to end. An order paid online is saved first ('pending_payment', stock held),
 * then a Razorpay order is created for its total. The order is placed only when Razorpay confirms a
 * captured payment of exactly that amount, reported by the browser (signature checked), the webhook
 * (signature checked) or the sweep below. An unpaid order gives its stock back after the hold.
 */

/** How long an unpaid online order keeps its pieces. Checkout's own timer closes the window sooner. */
export const PAYMENT_HOLD_MINUTES = 30
export const CHECKOUT_TIMEOUT_SECONDS = 15 * 60

export { onlinePaymentsAvailable } from '@/server/razorpay'

export interface CheckoutPayment {
  provider: 'razorpay'
  keyId: string
  razorpayOrderId: string
  amount: number
  currency: string
  name: string
  description: string
  prefill: { name: string; email: string; contact?: string }
  timeoutSeconds: number
}

/** Creates the Razorpay order for a just-saved online order. If Razorpay fails, the order is released. */
export async function startOnlinePayment(order: Order, store: StoreSettings): Promise<CheckoutPayment> {
  const c = razorpayConfig()
  // Charged in the order's own currency (INR orders in rupees, USD orders in dollars).
  const amount = toSubunits(order.total, order.currency)
  try {
    if (!c) throw new RazorpayError('Razorpay keys are not set', null)
    const rzp = await createRazorpayOrder(c, {
      amount,
      currency: order.currency,
      receipt: order.orderNumber,
      notes: { order_id: order.id, order_number: order.orderNumber },
    })
    await setRazorpayOrderId(order.id, rzp.id)
    return {
      provider: 'razorpay',
      keyId: c.keyId,
      razorpayOrderId: rzp.id,
      amount,
      currency: order.currency,
      name: store.name,
      description: `Order ${order.orderNumber}`,
      prefill: { name: order.customerName, email: order.email, contact: order.shippingAddress.phone || undefined },
      timeoutSeconds: CHECKOUT_TIMEOUT_SECONDS,
    }
  } catch (err) {
    console.error('[payments] could not start a Razorpay payment', order.orderNumber, err)
    const released = await releaseUnpaidOrder(order.id)
    invalidate('products')
    if (released) await checkoutAbandoned(released, 'start-failed')
    throw new HttpError(502, 'We could not start the online payment, so your order was not placed and nothing was charged. Please try again, or choose another way to pay.')
  }
}

export type Settlement =
  | { kind: 'paid'; order: Order; outcome: PaidOutcome }
  | { kind: 'pending' }
  | { kind: 'failed' }
  | { kind: 'mismatch' }

/**
 * Applies one Razorpay payment to the order it claims to be for. An authorised payment is captured
 * first (in case auto-capture is off in the dashboard). Anything that does not match the order's
 * amount and currency is reported to the store and never marks the order paid.
 */
async function settlePayment(c: RazorpayConfig, orderId: string, payment: RazorpayPayment): Promise<Settlement> {
  const state = await getPaymentState({ id: orderId })
  if (!state || state.paymentMethod !== 'razorpay' || !state.razorpayOrderId || payment.order_id !== state.razorpayOrderId) return { kind: 'failed' }
  const expected = toSubunits(state.total, state.currency)
  if (payment.amount !== expected || payment.currency?.toUpperCase() !== state.currency.toUpperCase()) {
    const order = await getOrderById(orderId)
    await paymentMismatch(orderId, order?.orderNumber ?? orderId, [
      ['Order', order?.orderNumber],
      ['Expected', `${expected} ${state.currency} (smallest unit)`],
      ['Paid', `${payment.amount} ${payment.currency}`],
      ['Razorpay payment', payment.id],
      ['Payment status', payment.status],
    ])
    return { kind: 'mismatch' }
  }
  let p = payment
  if (p.status === 'authorized') {
    try {
      p = await capturePayment(c, p.id, p.amount, p.currency)
    } catch (err) {
      // The browser and the webhook can race to capture the same payment; read where it ended up.
      console.warn('[payments] capture failed, re-reading the payment', p.id, (err as Error).message)
      try {
        p = await fetchPayment(c, p.id)
      } catch (again) {
        // Razorpay's error text stays in the log; the webhook or the sweep will settle the order.
        console.error('[payments] payment could not be re-read', p.id, (again as Error).message)
        return { kind: 'pending' }
      }
    }
  }
  if (p.status === 'captured') {
    const result = await markOrderPaid(orderId, p.id)
    return result ? { kind: 'paid', ...result } : { kind: 'failed' }
  }
  return p.status === 'failed' ? { kind: 'failed' } : { kind: 'pending' }
}

/** Store emails for a settled payment. Callers run this after responding (see `after`). */
export async function announce(s: Settlement): Promise<void> {
  if (s.kind !== 'paid') return
  if (s.outcome === 'confirmed' || s.outcome === 'reinstated') {
    await orderPlaced(s.order)
    await inventoryAfterOrder(s.order)
  }
  if (s.outcome === 'reinstated') {
    invalidate('products')
    await latePayment(s.order, 'reinstated')
  }
  if (s.outcome === 'paid-after-cancel') await latePayment(s.order, 'refund-needed')
}

/** The browser's report after Checkout succeeds: proof checked here, the payment itself read from Razorpay. */
export async function confirmFromCheckout(orderId: string, input: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }): Promise<Settlement> {
  const state = await getPaymentState({ id: orderId })
  // The same answer for every mismatch, so the route reveals nothing about other orders.
  if (!state || state.paymentMethod !== 'razorpay' || !state.razorpayOrderId || state.razorpayOrderId !== input.razorpayOrderId) {
    throw new HttpError(404, 'Order not found.')
  }
  const c = razorpayConfig()
  if (!c) throw new HttpError(503, 'Online payments are not available right now.')
  if (!verifyPaymentSignature(c, state.razorpayOrderId, input.razorpayPaymentId, input.razorpaySignature)) {
    throw new HttpError(400, 'This payment could not be verified. If you were charged, contact us with your order number.')
  }
  let payment: RazorpayPayment
  try {
    payment = await fetchPayment(c, input.razorpayPaymentId)
  } catch (err) {
    // The signature proves Razorpay took the payment; the webhook or the sweep will finish the job.
    console.error('[payments] payment verified but not readable yet', input.razorpayPaymentId, err)
    return { kind: 'pending' }
  }
  return settlePayment(c, orderId, payment)
}

/** A Razorpay payment reported by the webhook. Unknown orders (another app on the same account) are ignored. */
export async function settleFromWebhook(payment: RazorpayPayment): Promise<Settlement | null> {
  const c = razorpayConfig()
  if (!c || !payment?.order_id) return null
  const state = await getPaymentState({ razorpayOrderId: payment.order_id })
  if (!state) return null
  return settlePayment(c, state.id, payment)
}

/**
 * Asks Razorpay what happened to an order still waiting for payment. A captured or authorised payment
 * places it; with none, its hold is released. If Razorpay cannot be asked, nothing changes.
 */
export async function reconcileUnpaidOrder(orderId: string, reason: 'closed' | 'expired'): Promise<'paid' | 'released' | 'pending' | 'not-pending'> {
  const state = await getPaymentState({ id: orderId })
  if (!state || state.status !== 'pending_payment') return state?.paid ? 'paid' : 'not-pending'
  const c = razorpayConfig()
  if (!c) return 'pending'
  let payments: RazorpayPayment[] = []
  if (state.razorpayOrderId) {
    try {
      payments = await fetchOrderPayments(c, state.razorpayOrderId)
    } catch (err) {
      console.warn('[payments] could not reach Razorpay to check an unpaid order', orderId, (err as Error).message)
      return 'pending'
    }
  }
  const live = payments.filter((p) => p.status === 'captured' || p.status === 'authorized').sort((a, b) => Number(b.status === 'captured') - Number(a.status === 'captured'))
  for (const p of live) {
    const s = await settlePayment(c, orderId, p)
    if (s.kind === 'paid') {
      await announce(s)
      return 'paid'
    }
  }
  // Money was taken but did not match the order: keep holding it for a person to look at.
  if (live.length) return 'pending'
  const released = await releaseUnpaidOrder(orderId)
  if (!released) return 'not-pending'
  invalidate('products')
  await checkoutAbandoned(released, reason)
  return 'released'
}

type GlobalWithSweep = typeof globalThis & { __snugknotSweepAt?: number }

/**
 * Releases online orders left unpaid past the hold. Runs after other requests (see `after`) at most
 * once a minute per server instance, a few orders at a time, so no cron job is needed.
 */
export async function sweepUnpaidOrders(): Promise<void> {
  // Without keys there is nothing to ask Razorpay, and no online order can have been started.
  if (!razorpayConfig()) return
  const g = globalThis as GlobalWithSweep
  if (g.__snugknotSweepAt && Date.now() - g.__snugknotSweepAt < 60_000) return
  g.__snugknotSweepAt = Date.now()
  try {
    for (const o of await listStaleUnpaidOrders(PAYMENT_HOLD_MINUTES, 5)) await reconcileUnpaidOrder(o.id, 'expired')
  } catch (err) {
    console.error('[payments] sweep failed', err)
  }
}
