import type { CommerceSettings } from '@/types/commerce'

/**
 * The shop's delivery, refund and payment terms as shoppers read them, from the checkout settings,
 * so the shipping page, the FAQ, the policies and the checkout always say the same thing.
 */
type Terms = Pick<CommerceSettings, 'deliveryEstimate' | 'refundDays' | 'freeReturns' | 'returnWindowDays' | 'codEnabled' | 'onlinePaymentsEnabled'>

/** "Orders arrive in 3–7 working days." or '' when the owner has not set an estimate. */
export function deliveryText(c: Pick<Terms, 'deliveryEstimate'>): string {
  const est = c.deliveryEstimate?.trim()
  return est ? `Orders arrive in ${est} once placed; express orders are dispatched first.` : ''
}

export function refundText(c: Pick<Terms, 'refundDays' | 'codEnabled'>): string {
  const days = c.refundDays || 7
  const base = `Once the piece reaches us and passes its check, we refund the full price of the returned pieces to the way you paid (card, UPI, net banking or wallet) within ${days} working day${days === 1 ? '' : 's'}.`
  return c.codEnabled ? `${base} A pay-on-delivery order is refunded to the bank account or UPI ID you give us.` : base
}

export function returnShippingText(c: Pick<Terms, 'freeReturns'>): string {
  return c.freeReturns
    ? 'Return shipping is on us for every return.'
    : 'Return shipping is on us when a piece arrives damaged, faulty or not what you ordered. For any other return you send the piece back at your own cost, to the address we give you when the return is approved.'
}

/** One line on how orders are paid, or '' when checkout offers nothing yet. */
export function paymentText(c: Pick<Terms, 'codEnabled' | 'onlinePaymentsEnabled'>): string {
  if (c.onlinePaymentsEnabled) {
    return c.codEnabled
      ? 'Pay securely online through Razorpay (UPI, cards, net banking or wallets), or pay in cash on delivery at no extra charge.'
      : 'Pay securely online through Razorpay: UPI, cards, net banking or wallets.'
  }
  return c.codEnabled ? 'Pay in cash on delivery, at no extra charge.' : ''
}
