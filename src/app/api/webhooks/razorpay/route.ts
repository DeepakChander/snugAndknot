import { after } from 'next/server'
import { getPaymentState, markOrderRefunded } from '@/server/repo/orders'
import { razorpayConfig, verifyWebhookSignature, type RazorpayPayment } from '@/server/razorpay'
import { announce, settleFromWebhook } from '@/server/payments'
import { paymentRefunded } from '@/server/notify-events'

export const dynamic = 'force-dynamic'

const MAX_BODY = 1_000_000

interface WebhookEvent {
  event?: string
  payload?: { payment?: { entity?: RazorpayPayment } }
}

const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } })

/**
 * Razorpay → this shop, server to server. Set it up in Razorpay → Webhooks with the secret in
 * SNUGKNOT_RAZORPAY_WEBHOOK_SECRET. The signature covers the raw body, so it is read as text and
 * checked before anything is parsed. Every action is idempotent: Razorpay may repeat or reorder events.
 */
export async function POST(req: Request) {
  const c = razorpayConfig()
  if (!c?.webhookSecret) return json({ error: 'Webhook not configured.' }, 503)
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY) return json({ error: 'Too large.' }, 413)
  const raw = await req.text()
  if (raw.length > MAX_BODY) return json({ error: 'Too large.' }, 413)
  const signature = req.headers.get('x-razorpay-signature') ?? ''
  if (!verifyWebhookSignature(c.webhookSecret, raw, signature)) return json({ error: 'Invalid signature.' }, 401)

  let event: WebhookEvent
  try {
    event = JSON.parse(raw)
  } catch {
    return json({ error: 'Invalid JSON.' }, 400)
  }
  const payment = event.payload?.payment?.entity
  try {
    switch (event.event) {
      case 'payment.authorized':
      case 'payment.captured':
      case 'order.paid': {
        if (!payment) break
        const settlement = await settleFromWebhook(payment)
        if (settlement) after(() => announce(settlement))
        break
      }
      case 'refund.processed': {
        // Carries the payment too; only a refund of the whole amount marks the order refunded.
        if (!payment?.order_id || !(payment.amount_refunded && payment.amount_refunded >= payment.amount)) break
        const state = await getPaymentState({ razorpayOrderId: payment.order_id })
        if (!state) break
        const refunded = await markOrderRefunded(state.id)
        if (refunded) after(() => paymentRefunded(refunded))
        break
      }
      default:
        // payment.failed and the rest: Checkout lets the customer retry, and the sweep releases the hold.
        break
    }
  } catch (err) {
    console.error('[razorpay webhook]', event.event, err)
    // A 5xx makes Razorpay retry later.
    return json({ error: 'Could not process the event.' }, 500)
  }
  return json({ ok: true })
}
