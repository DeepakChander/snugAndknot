import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Razorpay over its REST API (no SDK). Keys come only from SNUGKNOT_-prefixed variables: the Vercel
 * project also carries another app's un-prefixed RAZORPAY_* keys, and reading those would send this
 * shop's payments to that app's account.
 */

const LIVE_API = 'https://api.razorpay.com/v1'
const TIMEOUT_MS = 8_000

export interface RazorpayConfig {
  keyId: string
  keySecret: string
  webhookSecret: string | null
  apiBase: string
}

/**
 * A local stand-in for the Razorpay API, for automated tests (scripts/razorpay-smoke.mjs). Only a
 * loopback address is accepted, so a stray value can never send the key secret to another host.
 */
function apiBase(): string {
  const override = process.env.SNUGKNOT_RAZORPAY_API_BASE?.trim()
  if (!override || process.env.VERCEL) return LIVE_API
  try {
    const u = new URL(override)
    if (u.protocol === 'http:' && (u.hostname === '127.0.0.1' || u.hostname === 'localhost')) return override.replace(/\/+$/, '')
  } catch {}
  return LIVE_API
}

export function razorpayConfig(): RazorpayConfig | null {
  const keyId = process.env.SNUGKNOT_RAZORPAY_KEY_ID?.trim()
  const keySecret = process.env.SNUGKNOT_RAZORPAY_KEY_SECRET?.trim()
  if (!keyId || !keySecret || !/^rzp_(test|live)_/.test(keyId)) return null
  return { keyId, keySecret, webhookSecret: process.env.SNUGKNOT_RAZORPAY_WEBHOOK_SECRET?.trim() || null, apiBase: apiBase() }
}

/** Online payment is offered only while the owner's switch is on and the keys are set. */
export function onlinePaymentsAvailable(commerce: { onlinePaymentsEnabled?: boolean }): boolean {
  return commerce.onlinePaymentsEnabled === true && razorpayConfig() !== null
}

/** What the admin settings page shows about the connection. Never includes a secret. */
export function razorpayStatus(): { configured: boolean; mode: 'test' | 'live' | null; webhook: boolean } {
  const c = razorpayConfig()
  return { configured: !!c, mode: c ? (c.keyId.startsWith('rzp_live_') ? 'live' : 'test') : null, webhook: !!c?.webhookSecret }
}

/** Razorpay amounts are integers in the currency's smallest unit: cents for USD, paise for INR, yen for JPY. */
export function toSubunits(amount: number, currency: string): number {
  const digits = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2
  return Math.round(amount * 10 ** digits)
}

export class RazorpayError extends Error {
  constructor(message: string, public status: number | null) {
    super(message)
  }
}

async function call<T>(c: RazorpayConfig, method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${c.apiBase}${path}`, {
      method,
      headers: {
        Authorization: `Basic ${Buffer.from(`${c.keyId}:${c.keySecret}`).toString('base64')}`,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    })
  } catch (err) {
    throw new RazorpayError(`Razorpay could not be reached: ${(err as Error).message}`, null)
  }
  const data = (await res.json().catch(() => ({}))) as { error?: { description?: string } }
  if (!res.ok) throw new RazorpayError(`Razorpay ${method} ${path} → ${res.status}: ${data.error?.description ?? 'no description'}`, res.status)
  return data as T
}

export interface RazorpayOrder {
  id: string
  amount: number
  currency: string
  status: string
}

export type RazorpayPaymentStatus = 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'

export interface RazorpayPayment {
  id: string
  order_id: string | null
  status: RazorpayPaymentStatus
  amount: number
  currency: string
  amount_refunded?: number
  method?: string
}

export function createRazorpayOrder(c: RazorpayConfig, input: { amount: number; currency: string; receipt: string; notes: Record<string, string> }) {
  return call<RazorpayOrder>(c, 'POST', '/orders', {
    amount: input.amount,
    currency: input.currency,
    receipt: input.receipt.slice(0, 40),
    notes: input.notes,
  })
}

export async function fetchOrderPayments(c: RazorpayConfig, razorpayOrderId: string): Promise<RazorpayPayment[]> {
  const res = await call<{ items?: RazorpayPayment[] }>(c, 'GET', `/orders/${encodeURIComponent(razorpayOrderId)}/payments`)
  return res.items ?? []
}

export function fetchPayment(c: RazorpayConfig, paymentId: string) {
  return call<RazorpayPayment>(c, 'GET', `/payments/${encodeURIComponent(paymentId)}`)
}

export function capturePayment(c: RazorpayConfig, paymentId: string, amount: number, currency: string) {
  return call<RazorpayPayment>(c, 'POST', `/payments/${encodeURIComponent(paymentId)}/capture`, { amount, currency })
}

function hmacMatches(secret: string, payload: string, signature: string): boolean {
  const expected = createHmac('sha256', secret).update(payload).digest()
  let given: Buffer
  try {
    given = Buffer.from(signature, 'hex')
  } catch {
    return false
  }
  return given.length === expected.length && timingSafeEqual(given, expected)
}

/**
 * Checkout's proof of payment: HMAC-SHA256 of "<order id>|<payment id>" with the key secret. The order
 * id must be the one this server created and stored, never the one the browser sends back.
 */
export function verifyPaymentSignature(c: RazorpayConfig, razorpayOrderId: string, paymentId: string, signature: string): boolean {
  return hmacMatches(c.keySecret, `${razorpayOrderId}|${paymentId}`, signature)
}

/** Webhooks: HMAC-SHA256 of the raw request body with the webhook secret (X-Razorpay-Signature). */
export function verifyWebhookSignature(secret: string, rawBody: string, signature: string): boolean {
  return hmacMatches(secret, rawBody, signature)
}
