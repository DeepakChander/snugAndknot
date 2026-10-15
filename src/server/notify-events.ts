import 'server-only'
import { isDeepStrictEqual } from 'node:util'
import { query } from '@/server/db/client'
import { getSettings } from '@/server/repo/settings'
import { UNPAID_ONLINE } from '@/server/repo/orders'
import { notify, type Field, type Section } from '@/server/notify'
import { mailConfig } from '@/server/mail'
import { formatMoney } from '@/lib/format'
import { findCurrency } from '@/lib/currency'
import type { Coupon, Order, Product, PublicUser, ReturnRequest, Review } from '@/types/commerce'

/**
 * Every email the store sends to its support inbox. One function per event; routes call them after
 * the change is saved. Grouped as: orders & payments, inventory, returns, reviews, customers,
 * contact & marketing, security, catalogue & settings (an audit trail of admin changes).
 */

/**
 * Wraps an event builder so it can never throw: builders read the database to fill in details, and a
 * hiccup there must not turn an order or form that was already saved into an error for the customer.
 */
function safely<A extends unknown[]>(name: string, build: (...args: A) => Promise<void>) {
  return async (...args: A): Promise<void> => {
    try {
      await build(...args)
    } catch (err) {
      console.error('[notify] event builder failed', name, err)
    }
  }
}

/** Formats amounts in `currency` (an order's own), else the base currency, with that currency's locale. */
async function money(currency?: string) {
  const { commerce } = await getSettings()
  const c = (currency && findCurrency(commerce, currency)) || null
  return (n: number) => formatMoney(n, currency ?? commerce.currency, c?.locale ?? commerce.locale, { cents: true })
}

const addressLines = (o: Order) => {
  const a = o.shippingAddress
  return [`${a.firstName} ${a.lastName}`, a.line1, a.line2, `${a.city}${a.state ? `, ${a.state}` : ''} ${a.postalCode}`, a.country].filter(Boolean).join(', ')
}
const itemLines = (o: Order, m: (n: number) => string) =>
  o.items.map((i) => `${i.quantity} × ${i.title}${i.size ? ` (${i.size})` : ''}${i.color ? `, ${i.color}` : ''} — ${m(i.price * i.quantity)}`)

/* ───────────────────────── Orders & payments ───────────────────────── */

const paymentLabel = (method: string) => (method === 'cod' ? 'Cash on delivery' : method === 'razorpay' ? 'Paid online (Razorpay)' : method)

/** A new order. Flags: first order, guest, coupon, express, high value, customer note, large order. */
export const orderPlaced = safely('orderPlaced', async (order: Order) => {
  const m = await money(order.currency)
  const { commerce } = await getSettings()
  const [{ n }] = await query<{ n: number }>(`SELECT count(*)::int AS n FROM orders WHERE lower(email) = lower($1) AND NOT ${UNPAID_ONLINE}`, [order.email])
  const pieces = order.items.reduce((s, i) => s + i.quantity, 0)
  const highValue = order.total >= Math.max(300, commerce.freeShippingThreshold * 2)
  const tags = [
    n <= 1 ? 'First order' : null,
    order.userId ? null : 'Guest',
    order.couponCode ? `Coupon ${order.couponCode}` : null,
    order.shippingMethod === 'express' ? 'Express' : null,
    highValue ? 'High value' : null,
    order.notes ? 'Customer note' : null,
    pieces >= 10 ? 'Large order' : null,
    order.paymentMethod === 'cod' ? 'Cash on delivery' : null,
    order.paymentMethod === 'razorpay' ? 'Paid online' : null,
  ].filter((t): t is string => !!t)
  await notify({
    type: 'order.placed',
    subject: `New order ${order.orderNumber} — ${m(order.total)}`,
    intro: `${order.customerName} placed order ${order.orderNumber}: ${pieces} piece${pieces === 1 ? '' : 's'}, ${m(order.total)}.`,
    tags,
    replyTo: order.email,
    sections: [
      { title: 'Items', list: itemLines(order, m) },
      {
        title: 'Totals',
        fields: [
          ['Subtotal', m(order.subtotal)],
          ['Discount', order.discount ? `−${m(order.discount)}${order.couponCode ? ` (${order.couponCode})` : ''}` : null],
          ['Shipping', `${m(order.shipping)} (${order.shippingMethod})`],
          ['Tax', order.tax ? m(order.tax) : null],
          ['Total', m(order.total)],
          ['Payment', `${paymentLabel(order.paymentMethod)} — ${order.paymentStatus}`],
          ['Razorpay payment', order.paymentReference],
        ],
      },
      {
        title: 'Customer',
        fields: [
          ['Name', order.customerName],
          ['Email', order.email],
          ['Phone', order.shippingAddress.phone],
          ['Account', order.userId ? 'Signed-in customer' : 'Guest checkout'],
          ['Orders from this email', n],
          ['Ship to', addressLines(order)],
        ],
      },
      ...(order.notes ? [{ title: 'Note from the customer', text: order.notes } satisfies Section] : []),
    ],
    action: { label: 'Open the order', path: `/admin/orders/${order.id}` },
  })
})

/** Status, payment and tracking changes made in the admin, one email per kind of change. */
export const orderUpdated = safely('orderUpdated', async (before: Order, after: Order, by: string) => {
  const m = await money(after.currency)
  const base = { replyTo: after.email, action: { label: 'Open the order', path: `/admin/orders/${after.id}` } }
  const who: Field = ['Changed by', by]
  const summary: Field[] = [['Order', after.orderNumber], ['Customer', `${after.customerName} <${after.email}>`], ['Total', m(after.total)]]

  // "Delivered" on a cash-on-delivery order also records the cash as paid: the delivered email says
  // so, and no separate payment email is sent for the same click.
  const codPaidOnDelivery =
    before.status !== after.status && after.status === 'delivered' && after.paymentMethod === 'cod' && after.paymentStatus === 'paid' && before.paymentStatus !== 'paid'

  if (before.status !== after.status) {
    const copy: Record<string, { subject: string; intro: string; extra?: Field[] }> = {
      confirmed: { subject: `Order ${after.orderNumber} confirmed`, intro: 'The order was confirmed and is being prepared.' },
      shipped: {
        subject: `Order ${after.orderNumber} shipped`,
        intro: 'The order left the workroom.',
        extra: [['Tracking number', after.trackingNumber], ['Shipping method', after.shippingMethod], ['Ship to', addressLines(after)]],
      },
      delivered: {
        subject: `Order ${after.orderNumber} delivered`,
        intro: `The order was marked delivered.${after.paymentMethod === 'cod' && after.paymentStatus === 'paid' ? ' Cash on delivery was recorded as paid.' : ''} The return window starts now.`,
      },
      cancelled: {
        subject: `Order ${after.orderNumber} cancelled`,
        intro: 'The order was cancelled. Its pieces went back into stock and any loyalty points from it were taken back.',
        extra: [['Pieces restocked', after.items.reduce((s, i) => s + i.quantity, 0)]],
      },
      placed: { subject: `Order ${after.orderNumber} moved back to placed`, intro: 'The order status was set back to placed.' },
    }
    const c = copy[after.status] ?? { subject: `Order ${after.orderNumber} is now ${after.status}`, intro: `Status changed to ${after.status}.` }
    await notify({
      ...base,
      type: `order.${after.status}`,
      subject: c.subject,
      intro: c.intro,
      tags: [`${before.status} → ${after.status}`, ...(codPaidOnDelivery ? [`Payment ${before.paymentStatus} → paid`] : [])],
      sections: [{ fields: [...summary, ...(c.extra ?? []), ['Previous status', before.status], who] }, { title: 'Items', list: itemLines(after, m) }],
    })
  }
  if (before.paymentStatus !== after.paymentStatus && !codPaidOnDelivery) {
    const refunded = after.paymentStatus === 'refunded'
    await notify({
      ...base,
      type: refunded ? 'order.refunded' : `order.payment_${after.paymentStatus}`,
      subject: refunded ? `Order ${after.orderNumber} refunded — ${m(after.total)}` : `Payment ${after.paymentStatus} for order ${after.orderNumber}`,
      intro: refunded ? 'The order payment was marked refunded.' : `Payment status changed from ${before.paymentStatus} to ${after.paymentStatus}.`,
      tags: [`Payment ${before.paymentStatus} → ${after.paymentStatus}`],
      sections: [{ fields: [...summary, ['Payment method', paymentLabel(after.paymentMethod)], who] }],
    })
  }
  if ((before.trackingNumber ?? '') !== (after.trackingNumber ?? '') && before.status === after.status) {
    await notify({
      ...base,
      type: 'order.tracking_updated',
      subject: `Tracking ${after.trackingNumber ? 'added' : 'removed'} for order ${after.orderNumber}`,
      intro: after.trackingNumber ? `Tracking number set to ${after.trackingNumber}.` : 'The tracking number was removed.',
      sections: [{ fields: [...summary, ['Status', after.status], ['Previous tracking', before.trackingNumber], ['Tracking', after.trackingNumber], who] }],
    })
  }
  if ((before.adminNotes ?? '') !== (after.adminNotes ?? '')) {
    await notify({
      ...base,
      replyTo: null,
      type: 'order.staff_note',
      subject: `Staff note updated on order ${after.orderNumber}`,
      intro: 'The internal note on this order changed. Customers never see it.',
      sections: [{ fields: [...summary, who] }, { title: 'Note', text: after.adminNotes || '(cleared)' }],
    })
  }
})

const razorpayLink = (o: Order): Field => ['Razorpay payment', o.paymentReference ? `${o.paymentReference} (dashboard.razorpay.com/app/payments/${o.paymentReference})` : null]

/**
 * An online payment arrived after the order's hold had run out. 'reinstated': every piece was still
 * in stock, so the order went ahead (orderPlaced is sent too). 'refund-needed': pieces sold out
 * meanwhile, so the order stays cancelled and the customer must be refunded in Razorpay.
 */
export const latePayment = safely('latePayment', async (order: Order, kind: 'reinstated' | 'refund-needed') => {
  const m = await money(order.currency)
  const refund = kind === 'refund-needed'
  await notify({
    type: refund ? 'payment.refund_needed' : 'payment.late_reinstated',
    subject: refund ? `Refund needed: ${order.orderNumber} was paid after it was cancelled — ${m(order.total)}` : `Late payment: ${order.orderNumber} went ahead after all`,
    intro: refund
      ? `${order.customerName} paid ${m(order.total)} online after the order's stock hold had run out, and some pieces have sold out since. The order stays cancelled. Refund the payment in the Razorpay dashboard and let the customer know.`
      : `${order.customerName}'s payment arrived after the order's stock hold had run out. Every piece was still in stock, so the order is placed and paid. Check it before shipping if it had been cancelled on purpose.`,
    tags: refund ? ['Payment', 'Action needed'] : ['Payment'],
    replyTo: order.email,
    sections: [{ fields: [['Order', order.orderNumber], ['Customer', `${order.customerName} <${order.email}>`], ['Total', m(order.total)], ['Status', order.status], razorpayLink(order)] }, { title: 'Items', list: itemLines(order, m) }],
    action: { label: 'Open the order', path: `/admin/orders/${order.id}` },
  })
})

/** An online checkout that was not paid: the customer closed it, it could not start, or it ran past the hold. Its stock is back. */
export const checkoutAbandoned = safely('checkoutAbandoned', async (order: Order, reason: 'closed' | 'expired' | 'start-failed') => {
  const m = await money(order.currency)
  const why = {
    closed: 'The customer closed the payment window without paying.',
    expired: 'The payment was not completed within 30 minutes.',
    'start-failed': 'Razorpay could not be reached to start the payment, so the customer saw an error.',
  }[reason]
  await notify({
    type: 'payment.checkout_abandoned',
    subject: `Unpaid checkout: ${order.orderNumber} — ${m(order.total)}`,
    intro: `${why} The order was cancelled and its pieces went back into stock. Nothing was charged. The customer never sees this order.`,
    tags: ['Payment', reason === 'start-failed' ? 'Razorpay error' : 'Not paid'],
    replyTo: order.email,
    sections: [{ fields: [['Order', order.orderNumber], ['Customer', `${order.customerName} <${order.email}>`], ['Total', m(order.total)]] }, { title: 'Items', list: itemLines(order, m) }],
    action: { label: 'Open the order', path: `/admin/orders/${order.id}` },
  })
})

/** Razorpay reported a payment for an order that does not match it. Nothing was marked paid. */
export const paymentMismatch = safely('paymentMismatch', async (orderId: string, orderNumber: string, fields: Field[]) => {
  await notify({
    type: 'payment.mismatch',
    subject: `Payment does not match order ${orderNumber}`,
    intro: 'A Razorpay payment for this order has a different amount or currency, or was not captured. The order was not marked paid. Check the payment in the Razorpay dashboard.',
    tags: ['Payment', 'Action needed'],
    dedupe: { key: orderId, minutes: 60 },
    sections: [{ fields }],
    action: { label: 'Open the order', path: `/admin/orders/${orderId}` },
  })
})

/** A full refund made in the Razorpay dashboard, reported by the webhook. */
export const paymentRefunded = safely('paymentRefunded', async (order: Order) => {
  const m = await money(order.currency)
  await notify({
    type: 'order.refunded',
    subject: `Order ${order.orderNumber} refunded — ${m(order.total)}`,
    intro: 'Razorpay reported a full refund for this order, so its payment is now marked refunded.',
    tags: ['Payment paid → refunded'],
    replyTo: order.email,
    sections: [{ fields: [['Order', order.orderNumber], ['Customer', `${order.customerName} <${order.email}>`], ['Total', m(order.total)], razorpayLink(order), ['Changed by', 'Razorpay webhook']] }],
    action: { label: 'Open the order', path: `/admin/orders/${order.id}` },
  })
})

/* ───────────────────────── Inventory ───────────────────────── */

const LOW_STOCK = 3

/** After an order: sizes that ran low or sold out, and pieces with nothing left in any size. */
export const inventoryAfterOrder = safely('inventoryAfterOrder', async (order: Order) => {
  const variantIds = order.items.map((i) => i.variantId).filter((v): v is string => !!v)
  if (!variantIds.length) return
  const rows = await query<{ variant_id: string; size: string | null; color: string | null; inventory: number; product_id: string; title: string; handle: string; product_left: number }>(
    `SELECT v.id AS variant_id, v.size, v.color, v.inventory, p.id AS product_id, p.title, p.handle,
            (SELECT coalesce(sum(v2.inventory), 0)::int FROM variants v2 WHERE v2.product_id = p.id) AS product_left
       FROM variants v JOIN products p ON p.id = v.product_id WHERE v.id = ANY($1)`,
    [variantIds]
  )
  const soldOutProducts = new Set<string>()
  for (const r of rows) {
    const label = `${r.title}${r.size ? ` — size ${r.size}` : ''}${r.color ? ` (${r.color})` : ''}`
    const action = { label: 'Restock in the admin', path: `/admin/products/${r.product_id}` }
    if (Number(r.product_left) === 0) soldOutProducts.add(r.product_id)
    if (Number(r.inventory) === 0) {
      await notify({
        type: 'stock.variant_sold_out',
        subject: `Sold out: ${label}`,
        intro: `Order ${order.orderNumber} took the last one. Shoppers now see this size as sold out.`,
        tags: ['Sold out'],
        sections: [{ fields: [['Piece', r.title], ['Size', r.size], ['Colour', r.color], ['Left in stock', 0], ['Left across all sizes', r.product_left]] }],
        action,
      })
    } else if (Number(r.inventory) <= LOW_STOCK) {
      await notify({
        type: 'stock.low',
        subject: `Low stock: ${label} — ${r.inventory} left`,
        intro: `After order ${order.orderNumber}, only ${r.inventory} remain in this size.`,
        tags: ['Low stock'],
        sections: [{ fields: [['Piece', r.title], ['Size', r.size], ['Left in stock', r.inventory], ['Left across all sizes', r.product_left]] }],
        action,
      })
    }
  }
  for (const productId of soldOutProducts) {
    const r = rows.find((x) => x.product_id === productId)!
    await notify({
      type: 'stock.product_sold_out',
      subject: `Completely sold out: ${r.title}`,
      intro: `Every size of ${r.title} is now sold out. Back-in-stock requests will keep arriving until it is restocked.`,
      tags: ['Sold out', 'All sizes'],
      sections: [{ fields: [['Piece', r.title], ['Page', `/product/${r.handle}`], ['Last order', order.orderNumber]] }],
      action: { label: 'Restock in the admin', path: `/admin/products/${productId}` },
    })
  }
})

/** A shopper asked to hear when a sold-out piece or size comes back. */
export const stockAlertRequested = safely('stockAlertRequested', async (productId: string, variantId: string | null, email: string) => {
  const [row] = await query<{ title: string; size: string | null; waiting: number }>(
    `SELECT p.title, (SELECT size FROM variants WHERE id = $2) AS size,
            (SELECT count(*)::int FROM stock_alerts WHERE product_id = $1 AND (variant_id = $2 OR ($2::text IS NULL AND variant_id IS NULL))) AS waiting
       FROM products p WHERE p.id = $1`,
    [productId, variantId]
  )
  if (!row) return
  await notify({
    type: 'stock_alert.requested',
    subject: `Back-in-stock request: ${row.title}${row.size ? ` (size ${row.size})` : ''}`,
    intro: `${email} wants to know when this comes back. ${row.waiting} ${row.waiting === 1 ? 'person is' : 'people are'} now waiting.`,
    tags: ['Waitlist'],
    replyTo: email,
    sections: [{ fields: [['Piece', row.title], ['Size', row.size ?? 'Any'], ['Email', email], ['Waiting in total', row.waiting]] }],
    action: { label: 'See all requests', path: '/admin/inbox?tab=alerts' },
  })
})

/** An admin restocked sizes that people are waiting for. */
export const restockedWithWaitlist = safely('restockedWithWaitlist', async (before: Product, after: Product, by: string) => {
  const restocked = after.variants.filter((v) => {
    const old = before.variants.find((x) => x.id === v.id)
    return v.inventory > 0 && (!old || old.inventory === 0)
  })
  if (!restocked.length) return
  const ids = restocked.map((v) => v.id)
  const waiting = await query<{ email: string; variant_id: string | null }>(
    `SELECT email, variant_id FROM stock_alerts WHERE product_id = $1 AND (variant_id = ANY($2) OR variant_id IS NULL)`,
    [after.id, ids]
  )
  if (!waiting.length) return
  // One shopper waiting for two sizes is one person.
  const people = [...new Set(waiting.map((w) => w.email.toLowerCase()))]
  await notify({
    type: 'stock.restocked_waitlist',
    subject: `Back in stock with a waitlist: ${after.title} — ${people.length} waiting`,
    intro: `${restocked.map((v) => v.size || v.title).join(', ')} ${restocked.length === 1 ? 'is' : 'are'} back in stock, and ${people.length} ${people.length === 1 ? 'person asked' : 'people asked'} to be told. The shop does not email them automatically: write to them from here.`,
    tags: ['Restocked', 'Waitlist'],
    sections: [
      { fields: [['Piece', after.title], ['Restocked sizes', restocked.map((v) => `${v.size || v.title}: ${v.inventory}`).join(', ')], ['Requests', waiting.length], ['Restocked by', by]] },
      { title: 'Waiting', list: people },
    ],
    action: { label: 'Open the piece', path: `/admin/products/${after.id}` },
  })
})

/* ───────────────────────── Returns ───────────────────────── */

export const returnRequested = safely('returnRequested', async (ret: ReturnRequest, customer: { email: string; name: string }) => {
  const m = await money(ret.currency)
  const urgent = ret.reason === 'defective' || ret.reason === 'not-as-described'
  await notify({
    type: 'return.requested',
    subject: `Return requested for order ${ret.orderNumber} — ${m(ret.refundAmount)}`,
    intro: `${customer.name} asked to return ${ret.items.reduce((s, i) => s + i.quantity, 0)} piece(s) from order ${ret.orderNumber}.`,
    tags: [urgent ? 'Damaged or not as described' : null, 'Needs review'].filter((t): t is string => !!t),
    replyTo: customer.email,
    sections: [
      { fields: [['Order', ret.orderNumber], ['Customer', `${customer.name} <${customer.email}>`], ['Reason', ret.reason], ['Refund if approved', m(ret.refundAmount)]] },
      { title: 'Pieces', list: ret.items.map((i) => `${i.quantity} × ${i.title} — ${m(i.price * i.quantity)}`) },
      ...(ret.comments ? [{ title: 'Customer comments', text: ret.comments } satisfies Section] : []),
    ],
    action: { label: 'Review the return', path: '/admin/returns' },
  })
})

export const returnUpdated = safely('returnUpdated', async (before: ReturnRequest & { email: string; customerName: string }, status: string, by: string) => {
  if (before.status === status) return
  const m = await money(before.currency)
  const copy: Record<string, string> = {
    approved: 'The return was approved. The customer can send the pieces back.',
    rejected: 'The return was declined.',
    received: 'The returned pieces arrived and are ready to be checked.',
    refunded: `The return was refunded: ${m(before.refundAmount)}.`,
  }
  await notify({
    type: `return.${status}`,
    subject: `Return for order ${before.orderNumber} ${status}`,
    intro: copy[status] ?? `The return is now ${status}.`,
    tags: [`${before.status} → ${status}`],
    replyTo: before.email,
    sections: [
      { fields: [['Order', before.orderNumber], ['Customer', `${before.customerName} <${before.email}>`], ['Reason', before.reason], ['Refund amount', m(before.refundAmount)], ['Changed by', by]] },
      { title: 'Pieces', list: before.items.map((i) => `${i.quantity} × ${i.title}`) },
    ],
    action: { label: 'Open returns', path: '/admin/returns' },
  })
})

/* ───────────────────────── Reviews ───────────────────────── */

async function productTitle(productId: string) {
  const [p] = await query<{ title: string; handle: string }>('SELECT title, handle FROM products WHERE id = $1', [productId])
  return p ?? { title: 'a piece', handle: '' }
}

const FIT_LABEL = { small: 'runs small', true: 'true to size', large: 'runs large' } as const

export const reviewSubmitted = safely('reviewSubmitted', async (review: Review, email: string) => {
  const p = await productTitle(review.productId)
  const pending = review.status === 'pending'
  await notify({
    type: pending ? 'review.pending' : 'review.published',
    subject: `${pending ? 'Review to approve' : 'New review'}: ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)} on ${p.title}`,
    intro: pending ? `${review.author} reviewed ${p.title}. It waits for your approval before it appears.` : `${review.author} reviewed ${p.title}. It is already live (auto-approval is on).`,
    tags: [review.rating <= 2 ? 'Low rating' : null, review.verified ? 'Verified buyer' : 'Not a verified buyer', pending ? 'Needs approval' : null].filter((t): t is string => !!t),
    replyTo: email,
    sections: [
      { fields: [['Piece', p.title], ['Rating', `${review.rating} / 5`], ['Fit', review.fit ? FIT_LABEL[review.fit] : null], ['Author', `${review.author} <${email}>`]] },
      { title: review.title || 'Review', text: review.body },
    ],
    action: { label: pending ? 'Approve or reject' : 'See reviews', path: '/admin/reviews' },
  })
})

export const reviewUpdated = safely('reviewUpdated', async (before: Review, after: Review, by: string) => {
  const p = await productTitle(after.productId)
  if (before.status !== after.status) {
    await notify({
      type: `review.${after.status}`,
      subject: `Review ${after.status} on ${p.title}`,
      intro: `${after.author}'s ${after.rating}-star review is now ${after.status}.`,
      tags: [`${before.status} → ${after.status}`],
      sections: [{ fields: [['Piece', p.title], ['Rating', `${after.rating} / 5`], ['Changed by', by]] }, { title: after.title || 'Review', text: after.body }],
      action: { label: 'See reviews', path: '/admin/reviews' },
    })
  }
  if ((before.adminReply ?? '') !== (after.adminReply ?? '')) {
    await notify({
      type: 'review.replied',
      subject: `Reply ${after.adminReply ? 'posted' : 'removed'} on a review of ${p.title}`,
      intro: after.adminReply ? 'A public reply now shows under this review.' : 'The public reply was removed.',
      sections: [{ fields: [['Piece', p.title], ['Review by', after.author], ['Changed by', by]] }, { title: 'Reply', text: after.adminReply || '(removed)' }],
      action: { label: 'See reviews', path: '/admin/reviews' },
    })
  }
})

export const reviewDeleted = safely('reviewDeleted', async (review: Review, by: string) => {
  const p = await productTitle(review.productId)
  await notify({
    type: 'review.deleted',
    subject: `Review deleted on ${p.title}`,
    intro: `${review.author}'s ${review.rating}-star review was deleted permanently.`,
    sections: [{ fields: [['Piece', p.title], ['Deleted by', by]] }, { title: review.title || 'Review', text: review.body }],
  })
})

/* ───────────────────────── Customers ───────────────────────── */

export const customerSignedUp = safely('customerSignedUp', async (user: PublicUser) => {
  const [{ n }] = await query<{ n: number }>("SELECT count(*)::int AS n FROM users WHERE role = 'customer'")
  await notify({
    type: 'customer.signed_up',
    subject: `New customer account: ${user.name}`,
    intro: `${user.name} created an account. That makes ${n} customer accounts.`,
    tags: ['New account'],
    replyTo: user.email,
    sections: [{ fields: [['Name', user.name], ['Email', user.email], ['Welcome points', user.points]] }],
    action: { label: 'Open customers', path: '/admin/customers' },
  })
})

export const passwordChanged = safely('passwordChanged', async (user: PublicUser) => {
  await notify({
    type: 'customer.password_changed',
    subject: `Password changed: ${user.email}`,
    intro: `${user.name} changed their password. Every other device was signed out.`,
    tags: ['Security'],
    sections: [{ fields: [['Customer', `${user.name} <${user.email}>`], ['When', new Date().toUTCString()]] }],
  })
})

export const profileUpdated = safely('profileUpdated', async (before: PublicUser, after: { name: string; phone: string | null; email: string }) => {
  const changes: Field[] = []
  if (before.name !== after.name) changes.push(['Name', `${before.name} → ${after.name}`])
  if ((before.phone ?? '') !== (after.phone ?? '')) changes.push(['Phone', `${before.phone || '—'} → ${after.phone || '—'}`])
  if (!changes.length) return
  await notify({
    type: 'customer.profile_updated',
    subject: `Profile updated: ${after.email}`,
    intro: 'A customer changed their account details.',
    sections: [{ fields: [['Customer', after.email], ...changes] }],
    action: { label: 'Open customers', path: '/admin/customers' },
  })
})

export const customerRoleChanged = safely('customerRoleChanged', async (target: { email: string; name: string }, from: string, to: string, by: string) => {
  await notify({
    type: to === 'admin' ? 'customer.made_admin' : 'customer.admin_removed',
    subject: to === 'admin' ? `Admin access granted to ${target.email}` : `Admin access removed from ${target.email}`,
    intro: `${target.name}'s role changed from ${from} to ${to}. Their existing sessions were signed out.`,
    tags: ['Security', 'Role change'],
    sections: [{ fields: [['Account', `${target.name} <${target.email}>`], ['Role', `${from} → ${to}`], ['Changed by', by]] }],
    action: { label: 'Open customers', path: '/admin/customers' },
  })
})

export const customerPointsChanged = safely('customerPointsChanged', async (target: { email: string; name: string }, from: number, to: number, by: string) => {
  await notify({
    type: 'customer.points_changed',
    subject: `Loyalty points changed for ${target.email}: ${from} → ${to}`,
    intro: `${target.name}'s points balance was adjusted in the admin.`,
    sections: [{ fields: [['Account', `${target.name} <${target.email}>`], ['Points', `${from} → ${to}`], ['Changed by', by]] }],
    action: { label: 'Open customers', path: '/admin/customers' },
  })
})

/* ───────────────────────── Contact & marketing ───────────────────────── */

export const contactMessage = safely('contactMessage', async (input: { name: string; email: string; subject: string; message: string }) => {
  await notify({
    type: 'contact.message',
    subject: `Message from ${input.name}${input.subject ? `: ${input.subject}` : ''}`,
    intro: `${input.name} wrote through the contact form. Reply to this email to answer them directly.`,
    tags: ['Contact form'],
    replyTo: input.email,
    sections: [{ fields: [['From', `${input.name} <${input.email}>`], ['Subject', input.subject || '(none)']] }, { title: 'Message', text: input.message }],
    action: { label: 'Open the inbox', path: '/admin/inbox' },
  })
})

export const newsletterSubscribed = safely('newsletterSubscribed', async (email: string, source: string) => {
  const [{ n }] = await query<{ n: number }>('SELECT count(*)::int AS n FROM subscribers')
  await notify({
    type: 'newsletter.subscribed',
    subject: `New newsletter subscriber (from ${source})`,
    intro: `${email} joined the newsletter (from ${source}). The list now has ${n} ${n === 1 ? 'person' : 'people'}.`,
    tags: ['Newsletter'],
    sections: [{ fields: [['Email', email], ['Signed up from', source], ['List size', n]] }],
    action: { label: 'Open subscribers', path: '/admin/inbox?tab=subscribers' },
  })
})

export const subscriberRemoved = safely('subscriberRemoved', async (email: string, by: string) => {
  await notify({
    type: 'newsletter.removed',
    subject: 'Newsletter subscriber removed',
    intro: `${email} was removed from the newsletter list.`,
    sections: [{ fields: [['Email', email], ['Removed by', by]] }],
  })
})

export const messageHandled = safely('messageHandled', async (m: { name: string; email: string; subject: string }, action: 'read' | 'archived' | 'new' | 'deleted', by: string) => {
  const done = action === 'deleted' ? 'deleted' : `marked ${action}`
  await notify({
    type: `contact.${action}`,
    subject: `Contact message ${done}: ${m.subject || m.name}`,
    intro: `The message from ${m.name} <${m.email}> was ${done}.`,
    sections: [{ fields: [['Changed by', by]] }],
  })
})

/* ───────────────────────── Security ───────────────────────── */

/** How to shut an admin out: the owner account by rotating the variable, a promoted one from Customers. */
const stopAdmin = (owner: boolean) =>
  owner ? 'change ADMIN_PASSWORD now: that ends every session of the owner account' : 'remove its admin access in Admin → Customers: that ends its sessions'

/** `owner` is the ADMIN_EMAIL account; anyone else with the admin role was promoted in the panel. */
export const adminSignedIn = safely('adminSignedIn', async (email: string, ip: string, userAgent: string | null, owner: boolean) => {
  await notify({
    type: 'security.admin_signed_in',
    subject: `Admin sign-in: ${email}`,
    intro: `Someone signed in to the store admin${owner ? '' : ' with a promoted admin account'}. If this was not expected, ${stopAdmin(owner)}.`,
    tags: ['Security'],
    sections: [{ fields: [['Account', email], ['Account type', owner ? 'Store owner (ADMIN_EMAIL)' : 'Promoted admin'], ['IP address', ip], ['Device', userAgent], ['When', new Date().toUTCString()]] }],
  })
})

export const adminLoginFailed = safely('adminLoginFailed', async (email: string, ip: string, userAgent: string | null, owner: boolean) => {
  await notify({
    type: 'security.admin_login_failed',
    subject: `Failed admin sign-in for ${email}`,
    intro: `A wrong password was entered for ${owner ? 'the store owner account' : 'a promoted admin account'}. Repeats from the same address within 15 minutes are not emailed again. If it keeps happening, ${stopAdmin(owner)}.`,
    tags: ['Security'],
    dedupe: { key: ip, minutes: 15 },
    sections: [{ fields: [['Account', email], ['IP address', ip], ['Device', userAgent], ['When', new Date().toUTCString()]] }],
  })
})

export const customerSignedIn = safely('customerSignedIn', async (user: { id: string; email: string; name: string }, ip: string, userAgent: string | null) => {
  await notify({
    type: 'customer.signed_in',
    subject: `Customer signed in: ${user.name}`,
    intro: `${user.name} signed in to their account. Further sign-ins by this customer within an hour are not emailed again.`,
    dedupe: { key: user.id, minutes: 60 },
    sections: [{ fields: [['Customer', `${user.name} <${user.email}>`], ['IP address', ip], ['Device', userAgent]] }],
    action: { label: 'Open customers', path: '/admin/customers' },
  })
})

export const customerLoginFailed = safely('customerLoginFailed', async (email: string, ip: string, userAgent: string | null, known: boolean) => {
  await notify({
    type: 'customer.login_failed',
    subject: 'Failed customer sign-in',
    intro: `A sign-in with a wrong password${known ? '' : ' (no account uses that email)'}. Repeats from the same address within 15 minutes are not emailed again; sustained guessing is blocked by the rate limit.`,
    dedupe: { key: ip, minutes: 15 },
    sections: [{ fields: [['Email tried', email], ['Account exists', known ? 'yes' : 'no'], ['IP address', ip], ['Device', userAgent]] }],
  })
})

/** The guest order-tracking form: a found order, or a number and email that did not match. */
export const orderLookedUp = safely('orderLookedUp', async (orderNumber: string, email: string, order: { id: string; status: string } | null, ip: string) => {
  await notify({
    type: order ? 'order.lookup' : 'order.lookup_failed',
    subject: order ? `Order ${orderNumber} tracked by the customer` : `Order tracking found nothing for ${orderNumber}`,
    intro: order
      ? `Someone checked order ${orderNumber} on the tracking page. Its status is ${order.status}.`
      : 'Someone tried the tracking page with an order number and email that do not match an order. Repeats are emailed at most once an hour.',
    dedupe: { key: `${orderNumber.toUpperCase()}|${email.toLowerCase()}`, minutes: 60 },
    sections: [{ fields: [['Order number', orderNumber], ['Email given', email], ['IP address', ip]] }],
    ...(order ? { action: { label: 'Open the order', path: `/admin/orders/${order.id}` } } : {}),
  })
})

export const adminSignedOut = safely('adminSignedOut', async (email: string) => {
  await notify({
    type: 'security.admin_signed_out',
    subject: `Admin signed out: ${email}`,
    intro: 'Every admin session for this account was ended.',
    tags: ['Security'],
    sections: [{ fields: [['Account', email], ['When', new Date().toUTCString()]] }],
  })
})

const LIMIT_COPY: Record<string, string> = {
  loginIp: 'Many sign-in attempts from one connection — possible password guessing.',
  loginAccountIp: 'Repeated wrong passwords for one account from one connection.',
  loginEmail: 'Very many sign-in attempts against one account.',
  signup: 'Many accounts being created from one connection.',
  order: 'Many orders from one connection — possible fake orders.',
  orderEmail: 'Many orders for one email address.',
  orderDay: 'Daily order limit reached from one connection — possible fake orders.',
  payment: 'Many payment confirmations or cancellations from one connection.',
  orderLookupIp: 'Someone is guessing order numbers on the tracking page.',
  orderLookupEmail: 'Repeated tracking lookups for one email.',
  contact: 'Contact form flooding from one connection.',
  contactDaily: 'Daily contact-form limit reached from one connection.',
  review: 'Review flooding from one account.',
  returnRequest: 'Many return requests from one account.',
  newsletter: 'Newsletter sign-up flooding.',
  stockAlert: 'Back-in-stock request flooding.',
  passwordChange: 'Repeated password-change attempts on one account.',
  upload: 'Upload limit reached in the admin.',
}

/** A rate limit tripped: someone is hammering a form or endpoint. One email per limit and source per hour. */
export const rateLimited = safely('rateLimited', async (name: string, idHash: string) => {
  await notify({
    type: `security.rate_limited.${name}`,
    subject: `Rate limit reached: ${name}`,
    intro: `${LIMIT_COPY[name] ?? 'A rate limit was reached.'} Further requests are refused until the window resets. Repeats are emailed at most once an hour.`,
    tags: ['Security'],
    dedupe: { key: idHash, minutes: 60 },
    sections: [{ fields: [['Limit', name], ['Source (hashed)', idHash.slice(0, 12)], ['When', new Date().toUTCString()]] }],
  })
})

export const uploadRejected = safely('uploadRejected', async (filename: string, declared: string, reason: string, by: string) => {
  await notify({
    type: 'security.upload_rejected',
    subject: `Upload refused: ${filename}`,
    intro: `An image upload was refused: ${reason}`,
    tags: ['Security'],
    sections: [{ fields: [['File', filename], ['Declared type', declared], ['By', by]] }],
  })
})

/* ───────────────────────── Catalogue & settings (audit trail) ───────────────────────── */

const fieldLabel = (key: string) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
const brief = (v: unknown): string => {
  if (v === null || v === undefined || v === '') return '—'
  if (typeof v === 'boolean') return v ? 'yes' : 'no'
  const s = typeof v === 'string' ? v : JSON.stringify(v)
  return s.length > 120 ? `${s.slice(0, 117)}…` : s
}
const describeChange = (b: unknown, a: unknown) => {
  if (Array.isArray(b) || Array.isArray(a)) {
    const nb = Array.isArray(b) ? b.length : 0
    const na = Array.isArray(a) ? a.length : 0
    return nb === na ? `changed (${na} item${na === 1 ? '' : 's'})` : `${nb} → ${na} items`
  }
  return `${brief(b)} → ${brief(a)}`
}

/** One "Field: old → new" row for each top-level key that really changed (key order does not matter). */
function changedFields(before: object, after: object, ignore: string[] = []): Field[] {
  const b = before as Record<string, unknown>
  const a = after as Record<string, unknown>
  return [...new Set([...Object.keys(b), ...Object.keys(a)])]
    .filter((k) => !ignore.includes(k) && !isDeepStrictEqual(b[k], a[k]))
    .map((k): Field => [fieldLabel(k), describeChange(b[k], a[k])])
}

export const catalogChanged = safely('catalogChanged', async (
  kind: 'Product' | 'Category' | 'Collection' | 'Discount code' | 'Image',
  action: 'created' | 'updated' | 'deleted',
  label: string,
  by: string,
  details: Field[] = [],
  path?: string
) => {
  await notify({
    type: `${kind.toLowerCase().replace(/\s+/g, '_')}.${action}`,
    subject: `${kind} ${action}: ${label}`,
    intro: `${kind} "${label}" was ${action} in the admin.`,
    sections: [{ fields: [...details, ['By', by]] }],
    ...(path && action !== 'deleted' ? { action: { label: 'Open in the admin', path } } : {}),
  })
})

/** A category or collection was saved. Nothing is sent when the save changed nothing. */
export const catalogUpdated = safely('catalogUpdated', async (kind: 'Category' | 'Collection', before: object, after: object, label: string, by: string, path: string) => {
  const changes = changedFields(before, after)
  if (!changes.length) return
  await notify({
    type: `${kind.toLowerCase()}.updated`,
    subject: `${kind} updated: ${label}`,
    intro: `${kind} "${label}" was changed in the admin.`,
    sections: [{ fields: [...changes, ['By', by]] }],
    action: { label: 'Open in the admin', path },
  })
})

/**
 * A settings section was saved: lists what changed, and nothing is sent when nothing did. If the
 * store email changes while NOTIFY_EMAIL is unset, notices follow the new address, so this one also
 * goes to the old address: whoever held the inbox learns that it moved.
 */
export const settingsUpdated = safely('settingsUpdated', async (section: string, before: object, after: object, by: string) => {
  const changes = changedFields(before, after)
  if (!changes.length) return
  const was = (before as { email?: string }).email
  const now = (after as { email?: string }).email
  const inboxMoved = section === 'store' && !!was && was !== now && !process.env.NOTIFY_EMAIL?.trim() && !mailConfig()?.inbox
  await notify({
    type: 'settings.updated',
    subject: inboxMoved ? `Store email changed — notices now go to ${now}` : `Settings updated: ${section}`,
    intro: inboxMoved
      ? `The store email changed from ${was} to ${now}, so store notices now go to the new address. This one is copied to the old address so the change cannot go unnoticed.`
      : `The ${section} settings were changed in the admin.`,
    tags: inboxMoved ? ['Security', 'Inbox changed'] : [],
    alsoTo: inboxMoved ? was : null,
    sections: [{ fields: [['Section', section], ...changes, ['By', by]] }],
    action: { label: 'Open settings', path: section === 'videos' ? '/admin/videos' : `/admin/settings?tab=${section}` },
  })
})

export const productCreated = safely('productCreated', async (product: Product, by: string) => {
  const m = await money()
  await notify({
    type: 'product.created',
    subject: `Product created: ${product.title}`,
    intro: `"${product.title}" was added in the admin as ${product.status === 'active' ? 'a live piece' : `a ${product.status} piece`}.`,
    tags: product.status === 'active' ? ['Published'] : [],
    sections: [{ fields: [['Status', product.status], ['Price', m(product.price)], ['Sizes', product.variants.map((v) => v.size || v.title).join(', ')], ['Stock', product.variants.reduce((s, v) => s + v.inventory, 0)], ['By', by]] }],
    action: { label: 'Open the piece', path: `/admin/products/${product.id}` },
  })
})

/** Product edits: prices, publishing and stock called out on their own, other fields listed by name. */
export const productUpdated = safely('productUpdated', async (before: Product, after: Product, by: string) => {
  const m = await money()
  const changes: Field[] = []
  const tags: string[] = []
  if (before.price !== after.price || before.compareAtPrice !== after.compareAtPrice) {
    changes.push(['Price', `${m(before.price)} → ${m(after.price)}`])
    if (before.compareAtPrice !== after.compareAtPrice) changes.push(['Compare-at price', `${before.compareAtPrice ? m(before.compareAtPrice) : '—'} → ${after.compareAtPrice ? m(after.compareAtPrice) : '—'}`])
    tags.push('Price change')
  }
  if (before.status !== after.status) {
    changes.push(['Status', `${before.status} → ${after.status}`])
    tags.push(after.status === 'active' ? 'Published' : after.status === 'draft' ? 'Unpublished' : 'Archived')
  }
  if (before.title !== after.title) changes.push(['Title', `${before.title} → ${after.title}`])
  const stock = after.variants
    .map((v) => {
      const old = before.variants.find((x) => x.id === v.id)
      return old && old.inventory !== v.inventory ? `${v.size || v.title}: ${old.inventory} → ${v.inventory}` : null
    })
    .filter((s): s is string => !!s)
  if (stock.length) {
    changes.push(['Stock', stock.join(', ')])
    tags.push('Stock change')
  }
  const sizesOnly = (p: Product) => p.variants.map((v) => ({ ...v, inventory: 0, available: false }))
  const other = changedFields(before, after, ['price', 'compareAtPrice', 'status', 'title', 'variants', 'sizes', 'rating', 'reviewCount', 'createdAt', 'updatedAt']).map(([k]) => k.toLowerCase())
  if (!isDeepStrictEqual(sizesOnly(before), sizesOnly(after))) other.push('sizes or SKUs')
  if (other.length) changes.push(['Also changed', other.join(', ')])
  // Saved without changing anything: no email.
  if (!changes.length) return
  await notify({
    type: 'product.updated',
    subject: `Product updated: ${after.title}`,
    intro: 'These details changed:',
    tags,
    sections: [{ fields: [...changes, ['By', by]] }],
    action: { label: 'Open the piece', path: `/admin/products/${after.id}` },
  })
})

/** A discount code was created or saved; a save that changed nothing sends nothing. */
export const couponSaved = safely('couponSaved', async (action: 'created' | 'updated', coupon: Coupon, by: string, before?: Coupon | null) => {
  const changes = before ? changedFields(before, coupon, ['usedCount']) : []
  if (action === 'updated' && !changes.length) return
  const m = await money()
  await notify({
    type: `discount_code.${action}`,
    subject: `Discount code ${action}: ${coupon.code}`,
    intro: action === 'created' ? `Discount code ${coupon.code} was created in the admin.` : `Discount code ${coupon.code} was changed in the admin.`,
    sections: [
      {
        fields: [
          ['Discount', coupon.type === 'percentage' ? `${coupon.value}% off` : `${m(coupon.value)} off`],
          ['Minimum order', coupon.minPurchase ? m(coupon.minPurchase) : null],
          ['Expires', coupon.expiresAt],
          ['Active', coupon.active ? 'yes' : 'no'],
          ['Usage', coupon.usageLimit ? `${coupon.usedCount} of ${coupon.usageLimit}` : `${coupon.usedCount} (no limit)`],
          ['By', by],
        ],
      },
      ...(changes.length ? [{ title: 'What changed', fields: changes } satisfies Section] : []),
    ],
    action: { label: 'Open discount codes', path: '/admin/coupons' },
  })
})

export const testEmail = safely('testEmail', async (by: string) => {
  await notify({
    type: 'system.test',
    subject: 'Test email from your store',
    intro: 'Email notifications are working. Orders, returns, reviews, messages and security events will arrive in this inbox.',
    sections: [{ fields: [['Sent by', by], ['When', new Date().toUTCString()]] }],
  })
})
