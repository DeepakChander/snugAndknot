'use client'

/** What the server returns for an order paid online (see src/server/payments.ts). */
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

export interface RazorpaySuccess {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayInstance {
  open(): void
  on(event: 'payment.failed', cb: (res: unknown) => void): void
}
type RazorpayCtor = new (options: Record<string, unknown>) => RazorpayInstance
declare global {
  interface Window {
    Razorpay?: RazorpayCtor
  }
}

const SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'
let loading: Promise<RazorpayCtor> | null = null

/** Loads Razorpay Checkout once, only when a customer actually pays online. */
export function loadRazorpay(): Promise<RazorpayCtor> {
  if (window.Razorpay) return Promise.resolve(window.Razorpay)
  if (loading) return loading
  loading = new Promise<RazorpayCtor>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SCRIPT
    s.async = true
    s.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error('Razorpay did not load')))
    s.onerror = () => reject(new Error('Razorpay could not be loaded'))
    document.head.appendChild(s)
  }).catch((err) => {
    loading = null
    throw err
  })
  return loading
}

/**
 * Opens the Razorpay window. Resolves with the payment proof, or with null when the customer closes
 * the window without paying. A failed attempt keeps the window open so they can try another card.
 */
export async function payWithRazorpay(p: CheckoutPayment, theme: string): Promise<RazorpaySuccess | null> {
  const Razorpay = await loadRazorpay()
  return new Promise((resolve) => {
    let settled = false
    const done = (v: RazorpaySuccess | null) => {
      if (settled) return
      settled = true
      resolve(v)
    }
    const rzp = new Razorpay({
      key: p.keyId,
      order_id: p.razorpayOrderId,
      amount: p.amount,
      currency: p.currency,
      name: p.name,
      description: p.description,
      prefill: p.prefill,
      notes: { order: p.description },
      theme: { color: theme },
      timeout: p.timeoutSeconds,
      modal: { ondismiss: () => done(null), confirm_close: true },
      handler: (res: RazorpaySuccess) => done(res),
    })
    rzp.on('payment.failed', () => {
      // Checkout shows the reason and lets the customer retry; closing it ends in ondismiss.
    })
    rzp.open()
    watchForSilentClose(() => settled, () => done(null))
  })
}

/**
 * When Checkout cannot start (a wrong key, an unknown order) it shows an alert and hides its window
 * without calling ondismiss, which would leave checkout waiting for ever. Its window lives in
 * `.razorpay-container`; once that has been hidden for a few seconds nobody can be paying, so the
 * attempt counts as closed. If Razorpay renames the element this simply never fires.
 */
function watchForSilentClose(isSettled: () => boolean, close: () => void) {
  const started = Date.now()
  let seen = false
  let hiddenFor = 0
  const t = setInterval(() => {
    if (isSettled()) return clearInterval(t)
    const el = document.querySelector<HTMLElement>('.razorpay-container')
    if (!el) return
    const visible = getComputedStyle(el).display !== 'none'
    if (visible) {
      seen = true
      hiddenFor = 0
      return
    }
    hiddenFor += 1
    if ((seen && hiddenFor >= 3) || (!seen && Date.now() - started > 20_000)) {
      clearInterval(t)
      close()
    }
  }, 1000)
}
