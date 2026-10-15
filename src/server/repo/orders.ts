import 'server-only'
import { query, tx, type Queryable, type Row } from '@/server/db/client'
import type {
  Address,
  CommerceSettings,
  Coupon,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Quote,
  ReturnReason,
  ReturnRequest,
  ReturnStatus,
  ShippingMethod,
} from '@/types/commerce'
import { couponDiscount, couponProblem, getCoupon } from './coupons'
import { priceBook } from './products'
import { iso, isoOrNull, json, newId, num, round2 } from './util'
import { couponIn, findCurrency, variantPriceIn, baseCurrency, type ResolvedCurrency } from '@/lib/currency'

export class CheckoutError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
  }
}

export interface LineRequest {
  variantId: string
  quantity: number
}

interface PricedVariant {
  variantId: string
  productId: string
  handle: string
  title: string
  image: string
  size: string | null
  color: string | null
  /** In the requested currency; null when the piece has no price in it yet. */
  price: number | null
  inventory: number
}

async function loadVariants(q: Queryable, ids: string[], currency: ResolvedCurrency): Promise<Map<string, PricedVariant>> {
  if (!ids.length) return new Map()
  const rows = await q.query(
    `SELECT v.id, v.product_id, v.size, v.color, v.price, v.compare_at_price, v.prices AS variant_prices, v.inventory,
            p.title, p.handle, p.images, p.price AS product_price, p.compare_at_price AS product_compare_at, p.prices AS product_prices
       FROM variants v JOIN products p ON p.id = v.product_id
      WHERE v.id = ANY($1::text[]) AND p.status = 'active'`,
    [ids]
  )
  return new Map(
    rows.map((r) => [
      r.id as string,
      {
        variantId: r.id,
        productId: r.product_id,
        handle: r.handle,
        title: r.title,
        image: json<{ src: string }[]>(r.images, [])[0]?.src ?? '',
        size: r.size ?? null,
        color: r.color ?? null,
        price:
          variantPriceIn(
            { price: num(r.product_price), compareAtPrice: null, prices: priceBook(r.product_prices) },
            { price: num(r.price), compareAtPrice: null, prices: priceBook(r.variant_prices) },
            currency
          )?.price ?? null,
        inventory: Math.trunc(num(r.inventory)),
      },
    ])
  )
}

function mergeLines(lines: LineRequest[]): LineRequest[] {
  const merged = new Map<string, number>()
  for (const l of lines) {
    const qty = Math.trunc(l.quantity)
    if (!l.variantId || !(qty > 0)) continue
    merged.set(l.variantId, (merged.get(l.variantId) ?? 0) + qty)
  }
  return Array.from(merged, ([variantId, quantity]) => ({ variantId, quantity: Math.min(quantity, 20) }))
}

/**
 * Price a cart entirely on the server. Client-supplied prices are never trusted:
 * every figure here comes from the database and the commerce settings, in `opts.currency`
 * (an unknown or missing currency means the base currency).
 */
export async function quoteCart(
  lines: LineRequest[],
  opts: { couponCode?: string | null; shippingMethod?: ShippingMethod; commerce: CommerceSettings; currency?: string | null },
  q: Queryable = { query, exec: async () => {} }
): Promise<Quote> {
  const currency = findCurrency(opts.commerce, opts.currency) ?? baseCurrency(opts.commerce)
  const requested = mergeLines(lines)
  const variants = await loadVariants(q, requested.map((l) => l.variantId), currency)
  const issues: string[] = []
  const priced: Quote['lines'] = []

  for (const l of requested) {
    const v = variants.get(l.variantId)
    if (!v) {
      issues.push('An item in your bag is no longer available and was removed.')
      continue
    }
    let quantity = l.quantity
    if (v.price === null) {
      issues.push(`${v.title} is not sold in ${currency.code} yet and was removed. Switch currency to buy it.`)
      continue
    }
    const price = v.price
    if (v.inventory <= 0) {
      issues.push(`${v.title}${v.size ? ` (${v.size})` : ''} is sold out.`)
      continue
    }
    if (quantity > v.inventory) {
      issues.push(`Only ${v.inventory} of ${v.title}${v.size ? ` (${v.size})` : ''} left — quantity adjusted.`)
      quantity = v.inventory
    }
    priced.push({
      id: v.variantId,
      productId: v.productId,
      variantId: v.variantId,
      handle: v.handle,
      title: v.title,
      image: v.image,
      price,
      size: v.size,
      color: v.color,
      quantity,
      available: v.inventory,
      lineTotal: round2(price * quantity),
    })
  }

  const subtotal = round2(priced.reduce((s, l) => s + l.lineTotal, 0))

  let coupon: Coupon | null = null
  let couponError: string | null = null
  let discount = 0
  if (opts.couponCode?.trim()) {
    const found = await getCoupon(opts.couponCode, q)
    const terms = found ? couponIn(found, currency) : null
    if (!found) couponError = 'That code was not recognised.'
    else if (!terms) couponError = `That code cannot be used for orders in ${currency.code}.`
    else {
      const problem = couponProblem(found, subtotal, new Date(), terms)
      if (problem) couponError = problem
      else {
        coupon = found
        discount = couponDiscount(terms, subtotal)
      }
    }
  }

  const c = currency
  const afterDiscount = round2(subtotal - discount)
  const method = opts.shippingMethod ?? 'standard'
  let shipping = 0
  if (priced.length) {
    if (method === 'express') shipping = c.expressShippingRate
    else shipping = afterDiscount >= c.freeShippingThreshold ? 0 : c.standardShippingRate
  }
  const tax = round2((afterDiscount * Math.max(0, opts.commerce.taxRate)) / 100)
  const total = round2(afterDiscount + shipping + tax)

  return {
    currency: currency.code,
    lines: priced,
    subtotal,
    discount,
    shipping: round2(shipping),
    tax,
    total,
    coupon,
    couponError,
    freeShippingRemaining: round2(Math.max(0, c.freeShippingThreshold - afterDiscount)),
    issues,
  }
}

/* ─────────────────────────── Orders ─────────────────────────── */

function mapItem(r: Row): OrderItem {
  return {
    id: r.id,
    productId: r.product_id ?? null,
    variantId: r.variant_id ?? null,
    handle: r.handle,
    title: r.title,
    image: r.image,
    size: r.size ?? null,
    color: r.color ?? null,
    price: num(r.price),
    quantity: Math.trunc(num(r.quantity)),
  }
}

function mapOrder(r: Row, items: OrderItem[]): Order {
  return {
    id: r.id,
    orderNumber: r.order_number,
    userId: r.user_id ?? null,
    email: r.email,
    customerName: r.customer_name,
    status: r.status as OrderStatus,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status as PaymentStatus,
    shippingMethod: r.shipping_method as ShippingMethod,
    currency: (r.currency as string | null) ?? 'USD',
    subtotal: num(r.subtotal),
    shipping: num(r.shipping),
    discount: num(r.discount),
    tax: num(r.tax),
    total: num(r.total),
    couponCode: r.coupon_code ?? null,
    shippingAddress: json<Address>(r.shipping_address, {} as Address),
    trackingNumber: r.tracking_number ?? null,
    notes: r.notes ?? null,
    pointsEarned: Math.trunc(num(r.points_earned)),
    placedAt: iso(r.placed_at),
    confirmedAt: isoOrNull(r.confirmed_at),
    shippedAt: isoOrNull(r.shipped_at),
    deliveredAt: isoOrNull(r.delivered_at),
    cancelledAt: isoOrNull(r.cancelled_at),
    paidAt: isoOrNull(r.paid_at),
    paymentReference: r.razorpay_payment_id ?? null,
    items,
  }
}

async function attachItems(q: Queryable, rows: Row[]): Promise<Order[]> {
  if (!rows.length) return []
  const ids = rows.map((r) => r.id)
  const items = await q.query('SELECT * FROM order_items WHERE order_id = ANY($1::text[]) ORDER BY id', [ids])
  const byOrder = new Map<string, OrderItem[]>()
  for (const it of items) {
    const list = byOrder.get(it.order_id) ?? []
    list.push(mapItem(it))
    byOrder.set(it.order_id, list)
  }
  return rows.map((r) => mapOrder(r, byOrder.get(r.id) ?? []))
}

export interface PlaceOrderInput {
  lines: LineRequest[]
  couponCode: string | null
  shippingMethod: ShippingMethod
  email: string
  address: Address
  notes: string | null
  userId: string | null
  paymentMethod: PaymentMethod
  commerce: CommerceSettings
  /** Must be one of the shop's currencies (the route checks); defaults to the base currency. */
  currency?: string | null
}

/**
 * An online order that was never paid: its checkout was abandoned or the payment failed. Customers
 * never see these, and they are left out of sales figures.
 */
export const UNPAID_ONLINE = "(payment_method = 'razorpay' AND paid_at IS NULL)"

/**
 * Cash-on-delivery orders are placed straight away. Online orders start as 'pending_payment' with
 * their stock and coupon held; markOrderPaid() places them, releaseUnpaidOrder() gives the stock back.
 * Loyalty points are granted only once the order is placed.
 */
export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  return tx(async (q) => {
    const quote = await quoteCart(input.lines, input, q)
    if (!quote.lines.length) throw new CheckoutError(quote.issues[0] ?? 'Your bag is empty or every item is sold out.')
    const requested = mergeLines(input.lines)
    // Refuse rather than silently changing what the customer agreed to pay for.
    for (const r of requested) {
      const line = quote.lines.find((l) => l.variantId === r.variantId)
      if (!line || line.quantity !== r.quantity) {
        throw new CheckoutError(quote.issues[0] ?? 'Some items changed availability. Please review your bag.', 409)
      }
    }
    if (input.couponCode && !quote.coupon) throw new CheckoutError(quote.couponError ?? 'That code cannot be applied.')

    for (const l of quote.lines) {
      const ok = await q.query(
        'UPDATE variants SET inventory = inventory - $2 WHERE id = $1 AND inventory >= $2 RETURNING id',
        [l.variantId, l.quantity]
      )
      if (!ok.length) throw new CheckoutError(`${l.title} just sold out in that size.`, 409)
    }
    if (quote.coupon) {
      const ok = await q.query(
        `UPDATE coupons SET used_count = used_count + 1
          WHERE code = $1 AND (usage_limit IS NULL OR used_count < usage_limit) RETURNING code`,
        [quote.coupon.code]
      )
      if (!ok.length) throw new CheckoutError('That code has just reached its usage limit.', 409)
    }

    const seq = await q.query<{ n: number }>("SELECT nextval('order_number_seq')::int AS n")
    const orderNumber = `SK-${new Date().getFullYear()}-${String(seq[0].n).padStart(5, '0')}`
    const id = newId('ord')
    const currency = findCurrency(input.commerce, quote.currency) ?? baseCurrency(input.commerce)
    const points = input.userId ? Math.floor(quote.total * Math.max(0, currency.pointsPerUnit)) : 0
    const name = `${input.address.firstName} ${input.address.lastName}`.trim()
    const status: OrderStatus = input.paymentMethod === 'razorpay' ? 'pending_payment' : 'placed'

    await q.query(
      `INSERT INTO orders (id, order_number, user_id, email, customer_name, status, payment_method, payment_status,
         shipping_method, subtotal, shipping, discount, tax, total, coupon_code, shipping_address, notes, points_earned, currency)
       VALUES ($1, $2, $3, lower($4), $5, $17, $6, 'pending', $7, $8, $9, $10, $11, $12, $13, $14::jsonb, $15, $16, $18)`,
      [
        id, orderNumber, input.userId, input.email.trim(), name, input.paymentMethod, input.shippingMethod,
        quote.subtotal, quote.shipping, quote.discount, quote.tax, quote.total, quote.coupon?.code ?? null,
        JSON.stringify(input.address), input.notes, points, status, quote.currency,
      ]
    )
    for (const [i, l] of quote.lines.entries()) {
      await q.query(
        `INSERT INTO order_items (id, order_id, product_id, variant_id, handle, title, image, size, color, price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [`${id}_${i}`, id, l.productId, l.variantId, l.handle, l.title, l.image, l.size, l.color, l.price, l.quantity]
      )
    }
    if (status === 'placed' && input.userId && points > 0) {
      await q.query('UPDATE users SET points = points + $2 WHERE id = $1', [input.userId, points])
    }
    const rows = await q.query('SELECT * FROM orders WHERE id = $1', [id])
    return (await attachItems(q, rows))[0]
  })
}

/* ─────────────────────────── Online payments ─────────────────────────── */

export async function setRazorpayOrderId(id: string, razorpayOrderId: string): Promise<void> {
  await query('UPDATE orders SET razorpay_order_id = $2, updated_at = now() WHERE id = $1', [id, razorpayOrderId])
}

/** The payment fields of one order, for the payment routes. Never sent to the browser as is. */
export async function getPaymentState(where: { id: string } | { razorpayOrderId: string }) {
  const [r] = 'id' in where
    ? await query('SELECT id, status, payment_method, payment_status, total, currency, razorpay_order_id, paid_at FROM orders WHERE id = $1', [where.id])
    : await query('SELECT id, status, payment_method, payment_status, total, currency, razorpay_order_id, paid_at FROM orders WHERE razorpay_order_id = $1', [where.razorpayOrderId])
  if (!r) return null
  return {
    id: r.id as string,
    status: r.status as OrderStatus,
    paymentMethod: r.payment_method as string,
    paymentStatus: r.payment_status as PaymentStatus,
    total: num(r.total),
    currency: (r.currency as string | null) ?? 'USD',
    razorpayOrderId: (r.razorpay_order_id as string | null) ?? null,
    paid: r.paid_at !== null && r.paid_at !== undefined,
  }
}

async function grantPoints(q: Queryable, row: Row) {
  const points = Math.trunc(num(row.points_earned))
  if (row.user_id && points > 0) await q.query('UPDATE users SET points = points + $2 WHERE id = $1', [row.user_id, points])
}

/**
 * What confirming a payment did. 'confirmed': the held order is now placed. 'already-paid': nothing
 * changed (the browser and the webhook both report the same payment). 'reinstated': the hold had
 * expired but every piece was still in stock, so the order went ahead. 'paid-after-cancel': the order
 * stays cancelled with the payment recorded, and the money has to be refunded.
 */
export type PaidOutcome = 'confirmed' | 'already-paid' | 'reinstated' | 'paid-after-cancel'

class OutOfStock extends Error {}

/** Records a verified, captured online payment. Safe to call any number of times for the same order. */
export async function markOrderPaid(id: string, paymentId: string): Promise<{ order: Order; outcome: PaidOutcome } | null> {
  const attempt = (reinstate: boolean) =>
    tx(async (q) => {
      const [row] = await q.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [id])
      if (!row) return null
      let outcome: PaidOutcome
      if (row.paid_at) outcome = 'already-paid'
      else if (row.status === 'pending_payment') {
        await q.query(
          `UPDATE orders SET status = 'placed', payment_status = 'paid', paid_at = now(), razorpay_payment_id = $2, updated_at = now() WHERE id = $1`,
          [id, paymentId]
        )
        await grantPoints(q, row)
        outcome = 'confirmed'
      } else if (row.status === 'cancelled' && reinstate) {
        const items = await q.query('SELECT variant_id, quantity FROM order_items WHERE order_id = $1', [id])
        for (const it of items) {
          if (!it.variant_id) continue
          const ok = await q.query('UPDATE variants SET inventory = inventory - $2 WHERE id = $1 AND inventory >= $2 RETURNING id', [it.variant_id, it.quantity])
          if (!ok.length) throw new OutOfStock()
        }
        // The customer has paid: their code counts again even if its limit was reached meanwhile.
        if (row.coupon_code) await q.query('UPDATE coupons SET used_count = used_count + 1 WHERE code = $1', [row.coupon_code])
        await q.query(
          `UPDATE orders SET status = 'placed', payment_status = 'paid', paid_at = now(), razorpay_payment_id = $2,
                  cancelled_at = NULL, updated_at = now() WHERE id = $1`,
          [id, paymentId]
        )
        await grantPoints(q, row)
        outcome = 'reinstated'
      } else {
        await q.query(`UPDATE orders SET payment_status = 'paid', paid_at = now(), razorpay_payment_id = $2, updated_at = now() WHERE id = $1`, [id, paymentId])
        outcome = 'paid-after-cancel'
      }
      const rows = await q.query('SELECT * FROM orders WHERE id = $1', [id])
      return { order: (await attachItems(q, rows))[0], outcome }
    })
  try {
    return await attempt(true)
  } catch (err) {
    if (!(err instanceof OutOfStock)) throw err
    return attempt(false)
  }
}

/** Gives back the stock and coupon an unpaid online order was holding. Does nothing to any other order. */
export async function releaseUnpaidOrder(id: string): Promise<Order | null> {
  return tx(async (q) => {
    const [row] = await q.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [id])
    if (!row || row.status !== 'pending_payment' || row.paid_at) return null
    const items = await q.query('SELECT variant_id, quantity FROM order_items WHERE order_id = $1', [id])
    for (const it of items) {
      if (it.variant_id) await q.query('UPDATE variants SET inventory = inventory + $2 WHERE id = $1', [it.variant_id, it.quantity])
    }
    if (row.coupon_code) await q.query('UPDATE coupons SET used_count = GREATEST(0, used_count - 1) WHERE code = $1', [row.coupon_code])
    await q.query(`UPDATE orders SET status = 'cancelled', cancelled_at = now(), updated_at = now() WHERE id = $1`, [id])
    const rows = await q.query('SELECT * FROM orders WHERE id = $1', [id])
    return (await attachItems(q, rows))[0]
  })
}

/** Online orders still waiting for payment after `minutes`, oldest first. */
export async function listStaleUnpaidOrders(minutes: number, limit: number): Promise<{ id: string; razorpayOrderId: string | null }[]> {
  const rows = await query(
    `SELECT id, razorpay_order_id FROM orders WHERE status = 'pending_payment' AND placed_at < now() - make_interval(mins => $1)
      ORDER BY placed_at LIMIT $2`,
    [minutes, limit]
  )
  return rows.map((r) => ({ id: r.id, razorpayOrderId: r.razorpay_order_id ?? null }))
}

/** A full refund made in the Razorpay dashboard. Only a paid order moves to refunded. */
export async function markOrderRefunded(id: string): Promise<Order | null> {
  const rows = await query(`UPDATE orders SET payment_status = 'refunded', updated_at = now() WHERE id = $1 AND payment_status = 'paid' RETURNING id`, [id])
  return rows.length ? getOrderById(id) : null
}

export async function getOrderById(id: string): Promise<Order | null> {
  const q: Queryable = { query, exec: async () => {} }
  const rows = await query('SELECT * FROM orders WHERE id = $1', [id])
  return (await attachItems(q, rows))[0] ?? null
}

/** The order plus staff-only fields. Only for admin pages and admin API routes. */
export async function getOrderAdmin(id: string): Promise<Order | null> {
  const q: Queryable = { query, exec: async () => {} }
  const rows = await query('SELECT * FROM orders WHERE id = $1', [id])
  const [order] = await attachItems(q, rows)
  return order ? { ...order, adminNotes: (rows[0].admin_notes as string | null) ?? null } : null
}

export async function findOrderForGuest(orderNumber: string, email: string): Promise<Order | null> {
  const q: Queryable = { query, exec: async () => {} }
  const rows = await query(`SELECT * FROM orders WHERE upper(order_number) = upper($1) AND lower(email) = lower($2) AND NOT ${UNPAID_ONLINE}`, [
    orderNumber.trim(),
    email.trim(),
  ])
  return (await attachItems(q, rows))[0] ?? null
}

/**
 * Orders placed while signed in to this account. Guest orders are deliberately not matched by
 * email: accounts are not email-verified, so anyone could register someone else's address.
 */
export async function listOrdersForUser(userId: string): Promise<Order[]> {
  const q: Queryable = { query, exec: async () => {} }
  const rows = await query(`SELECT * FROM orders WHERE user_id = $1 AND NOT ${UNPAID_ONLINE} ORDER BY placed_at DESC`, [userId])
  return attachItems(q, rows)
}

export async function listOrdersAdmin(opts: { status?: OrderStatus; search?: string; limit?: number } = {}) {
  const q: Queryable = { query, exec: async () => {} }
  const where: string[] = []
  const params: unknown[] = []
  if (opts.status) {
    params.push(opts.status)
    where.push(`status = $${params.length}`)
  }
  if (opts.search?.trim()) {
    params.push(`%${opts.search.trim()}%`)
    where.push(`(order_number ILIKE $${params.length} OR email ILIKE $${params.length} OR customer_name ILIKE $${params.length})`)
  }
  const rows = await query(
    `SELECT * FROM orders ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY placed_at DESC LIMIT ${Math.min(500, opts.limit ?? 200)}`,
    params
  )
  return attachItems(q, rows)
}

const STATUS_TIMESTAMP: Partial<Record<OrderStatus, string>> = {
  confirmed: 'confirmed_at',
  shipped: 'shipped_at',
  delivered: 'delivered_at',
  cancelled: 'cancelled_at',
}

export async function updateOrderAdmin(
  id: string,
  patch: { status?: OrderStatus; paymentStatus?: PaymentStatus; trackingNumber?: string | null; adminNotes?: string | null }
): Promise<Order | null> {
  const updated = await tx(async (q) => {
    const rows = await q.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [id])
    const current = rows[0]
    if (!current) return false
    // Until its payment is confirmed an online order can only be cancelled (which releases its stock).
    if (current.status === 'pending_payment' && ((patch.status && patch.status !== 'cancelled') || patch.paymentStatus)) {
      throw new CheckoutError('This order is still waiting for its online payment. You can only cancel it for now.', 409)
    }
    const sets: string[] = ['updated_at = now()']
    const params: unknown[] = [id]
    const set = (col: string, v: unknown) => {
      params.push(v)
      sets.push(`${col} = $${params.length}`)
    }
    if (patch.status && patch.status !== current.status) {
      if (current.status === 'cancelled') throw new CheckoutError('A cancelled order cannot be reopened.', 409)
      set('status', patch.status)
      const col = STATUS_TIMESTAMP[patch.status]
      if (col) sets.push(`${col} = coalesce(${col}, now())`)
      if (patch.status === 'cancelled') {
        // Put the stock back and take back loyalty points granted for this order.
        const items = await q.query('SELECT variant_id, quantity FROM order_items WHERE order_id = $1', [id])
        for (const it of items) {
          if (it.variant_id) {
            await q.query('UPDATE variants SET inventory = inventory + $2 WHERE id = $1', [it.variant_id, it.quantity])
          }
        }
        // An unpaid online order held its coupon use; points were never granted for it.
        if (current.status === 'pending_payment' && current.coupon_code) {
          await q.query('UPDATE coupons SET used_count = GREATEST(0, used_count - 1) WHERE code = $1', [current.coupon_code])
        }
        const pointsGranted = current.payment_method !== 'razorpay' || current.paid_at
        if (pointsGranted && current.user_id && num(current.points_earned) > 0) {
          await q.query('UPDATE users SET points = GREATEST(0, points - $2) WHERE id = $1', [
            current.user_id,
            Math.trunc(num(current.points_earned)),
          ])
        }
      }
      if (patch.status === 'delivered' && current.payment_method === 'cod' && !patch.paymentStatus) {
        set('payment_status', 'paid')
      }
    }
    if (patch.paymentStatus) set('payment_status', patch.paymentStatus)
    if (patch.trackingNumber !== undefined) set('tracking_number', patch.trackingNumber)
    if (patch.adminNotes !== undefined) set('admin_notes', patch.adminNotes)
    await q.query(`UPDATE orders SET ${sets.join(', ')} WHERE id = $1`, params)
    return true
  })
  return updated ? getOrderById(id) : null
}

/* ─────────────────────────── Returns ─────────────────────────── */

function mapReturn(r: Row): ReturnRequest {
  return {
    id: r.id,
    orderId: r.order_id,
    orderNumber: r.order_number,
    userId: r.user_id ?? null,
    status: r.status as ReturnStatus,
    reason: r.reason as ReturnReason,
    comments: r.comments ?? null,
    items: json(r.items, []),
    refundAmount: num(r.refund_amount),
    currency: (r.currency as string | null) ?? 'USD',
    createdAt: iso(r.created_at),
  }
}

export async function listReturnsForUser(userId: string): Promise<ReturnRequest[]> {
  const rows = await query(
    `SELECT r.*, o.order_number, o.currency FROM returns r JOIN orders o ON o.id = r.order_id
      WHERE r.user_id = $1 ORDER BY r.created_at DESC`,
    [userId]
  )
  return rows.map(mapReturn)
}

export async function listReturnsAdmin(): Promise<(ReturnRequest & { email: string; customerName: string })[]> {
  const rows = await query(
    `SELECT r.*, o.order_number, o.currency, o.email, o.customer_name FROM returns r JOIN orders o ON o.id = r.order_id
      ORDER BY (r.status = 'pending') DESC, r.created_at DESC`
  )
  return rows.map((r) => ({ ...mapReturn(r), email: r.email, customerName: r.customer_name }))
}

export async function createReturn(input: {
  userId: string
  orderId: string
  items: { orderItemId: string; quantity: number }[]
  reason: ReturnReason
  comments: string | null
  returnWindowDays: number
}): Promise<ReturnRequest> {
  // Merge repeated lines first, so [{A,1},{A,1}] counts as two of A.
  const wanted = new Map<string, number>()
  for (const req of input.items) {
    const qty = Math.trunc(req.quantity)
    if (qty > 0) wanted.set(req.orderItemId, (wanted.get(req.orderItemId) ?? 0) + qty)
  }

  return tx(async (q) => {
    // Lock the order row: two simultaneous requests for the same order run one after the other.
    const locked = await q.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [input.orderId])
    const [order] = await attachItems(q, locked)
    if (!order || order.userId !== input.userId) {
      throw new CheckoutError('Order not found.', 404)
    }
    if (order.status !== 'delivered') throw new CheckoutError('Returns open once your order has been delivered.')
    const deliveredAt = new Date(order.deliveredAt ?? order.placedAt).getTime()
    if (Date.now() - deliveredAt > input.returnWindowDays * 86400_000) {
      throw new CheckoutError(`The ${input.returnWindowDays}-day return window for this order has closed.`)
    }
    const existing = await q.query<{ items: unknown }>(
      `SELECT items FROM returns WHERE order_id = $1 AND status <> 'rejected'`,
      [order.id]
    )
    const alreadyReturned = new Map<string, number>()
    for (const r of existing) {
      for (const it of json<{ orderItemId: string; quantity: number }[]>(r.items, [])) {
        alreadyReturned.set(it.orderItemId, (alreadyReturned.get(it.orderItemId) ?? 0) + it.quantity)
      }
    }
    const items: ReturnRequest['items'] = []
    for (const [orderItemId, qty] of wanted) {
      const it = order.items.find((i) => i.id === orderItemId)
      if (!it) continue
      const remaining = it.quantity - (alreadyReturned.get(it.id) ?? 0)
      if (qty > remaining) throw new CheckoutError(`Only ${Math.max(0, remaining)} of ${it.title} can still be returned.`)
      items.push({ orderItemId: it.id, title: it.title, quantity: qty, price: it.price, image: it.image })
    }
    if (!items.length) throw new CheckoutError('Choose at least one item to return.')
    // Refund what was actually paid for these pieces: their share of the order discount comes off.
    const gross = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const paidShare = order.subtotal > 0 ? Math.max(0, 1 - order.discount / order.subtotal) : 1
    const refund = round2(gross * paidShare)
    const rows = await q.query(
      `INSERT INTO returns (id, order_id, user_id, reason, comments, items, refund_amount)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7) RETURNING *, $8::text AS order_number, $9::text AS currency`,
      [newId('ret'), order.id, input.userId, input.reason, input.comments, JSON.stringify(items), refund, order.orderNumber, order.currency]
    )
    return mapReturn(rows[0])
  })
}

/** One return with the order's customer, for the admin and its notifications. */
export async function getReturnAdmin(id: string): Promise<(ReturnRequest & { email: string; customerName: string }) | null> {
  const rows = await query(
    `SELECT r.*, o.order_number, o.currency, o.email, o.customer_name FROM returns r JOIN orders o ON o.id = r.order_id WHERE r.id = $1`,
    [id]
  )
  return rows[0] ? { ...mapReturn(rows[0]), email: rows[0].email, customerName: rows[0].customer_name } : null
}

export async function updateReturnAdmin(id: string, status: ReturnStatus): Promise<boolean> {
  const rows = await query('UPDATE returns SET status = $2, updated_at = now() WHERE id = $1 RETURNING id', [id, status])
  return rows.length > 0
}
