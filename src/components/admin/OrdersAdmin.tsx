'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useMoney } from '@/components/providers/SettingsProvider'
import { OrderTimeline } from '@/components/account/OrderBits'
import { Badge, Btn, Card, Empty, Input, PageHeader, STATUS_TONE, Select, Textarea, confirmAction, useMutate } from './ui'
import { cn, formatDate } from '@/lib/format'
import type { Order, OrderStatus, PaymentStatus, ReturnRequest, ReturnStatus } from '@/types/commerce'

const TABS: (OrderStatus | 'all')[] = ['all', 'pending_payment', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled']
const statusLabel = (s: OrderStatus | 'all') => (s === 'pending_payment' ? 'awaiting payment' : s)
/** An online checkout that was never paid (abandoned, failed, or still open). */
const unpaidOnline = (o: Order) => o.paymentMethod === 'razorpay' && !o.paidAt

export function OrdersList({ orders, initialStatus }: { orders: Order[]; initialStatus: string }) {
  const money = useMoney()
  const [status, setStatus] = useState<OrderStatus | 'all'>(TABS.includes(initialStatus as OrderStatus) ? (initialStatus as OrderStatus) : 'all')
  const [q, setQ] = useState('')
  const rows = useMemo(
    () => orders.filter((o) => (status === 'all' || o.status === status) && (!q.trim() || [o.orderNumber, o.email, o.customerName].join(' ').toLowerCase().includes(q.trim().toLowerCase()))),
    [orders, status, q]
  )
  const count = (s: OrderStatus | 'all') => (s === 'all' ? orders.length : orders.filter((o) => o.status === s).length)

  return (
    <>
      <PageHeader title="Orders" description="Confirm, ship and deliver orders. Customers see every change on their order page straight away." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="no-scrollbar flex overflow-x-auto rounded-full border border-ink/10 bg-white/70 p-1">
          {TABS.map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)} className={cn('shrink-0 rounded-full px-3.5 py-1.5 text-sm capitalize', status === s ? 'bg-ink text-ivory' : 'text-ink/70 hover:text-ink')}>
              {statusLabel(s)} <span className="ml-1 text-xs opacity-60">{count(s)}</span>
            </button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order number, name or email" className="h-10 min-w-[240px] flex-1 rounded-full border border-ink/15 bg-white px-4 text-sm outline-none focus:border-ink/50" />
      </div>
      {rows.length ? (
        <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white/70">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-ink/10 text-left text-xs text-stone">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-3 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium">Placed</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Payment</th>
                <th className="px-3 py-3 font-medium">Items</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {rows.map((o) => (
                <tr key={o.id} className="hover:bg-ink/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs hover:text-burgundy">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <span className="block">{o.customerName}</span>
                    <span className="text-xs text-stone">
                      {o.email}
                      {o.userId ? '' : ' · guest'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-stone">{formatDate(o.placedAt, 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className="px-3 py-3">
                    <Badge tone={STATUS_TONE[o.status]}>{statusLabel(o.status)}</Badge>
                  </td>
                  <td className="px-3 py-3">
                    {o.status === 'cancelled' && unpaidOnline(o) ? (
                      <Badge tone="neutral">not paid</Badge>
                    ) : (
                      <Badge tone={o.paymentStatus === 'paid' ? 'good' : o.paymentStatus === 'refunded' ? 'neutral' : 'warn'}>{o.paymentStatus}</Badge>
                    )}
                    <span className="ml-1.5 text-xs text-stone">{o.paymentMethod === 'cod' ? 'COD' : o.paymentMethod === 'razorpay' ? 'online' : o.paymentMethod}</span>
                  </td>
                  <td className="px-3 py-3 tabular-nums">{o.items.reduce((s, i) => s + i.quantity, 0)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(o.total, { currency: o.currency })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No orders here">Orders placed on the storefront appear in this list.</Empty>
      )}
    </>
  )
}

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  placed: { to: 'confirmed', label: 'Confirm order' },
  confirmed: { to: 'shipped', label: 'Mark as shipped' },
  shipped: { to: 'delivered', label: 'Mark as delivered' },
}

export function OrderDetailAdmin({ order }: { order: Order }) {
  const money = useMoney(order.currency)
  const { run, busy } = useMutate()
  const [tracking, setTracking] = useState(order.trackingNumber ?? '')
  const [notes, setNotes] = useState(order.adminNotes ?? '')
  const next = NEXT[order.status]
  const a = order.shippingAddress

  const patch = (body: Record<string, unknown>, msg: string) => run('PATCH', `/api/admin/orders/${order.id}`, body, msg)

  return (
    <>
      <PageHeader
        back={
          <Link href="/admin/orders" className="mb-2 inline-block text-xs text-stone hover:text-ink">
            ← Orders
          </Link>
        }
        title={order.orderNumber}
        description={
          <>
            Placed {formatDate(order.placedAt, 'en-US', { dateStyle: 'long', timeStyle: 'short' })} · <Badge tone={STATUS_TONE[order.status]}>{statusLabel(order.status)}</Badge> <Badge tone={order.paymentStatus === 'paid' ? 'good' : 'warn'}>{order.status === 'cancelled' && unpaidOnline(order) ? 'not paid' : order.paymentStatus}</Badge>
          </>
        }
        actions={
          <>
            {next ? (
              <Btn loading={busy} onClick={() => patch(next.to === 'shipped' && tracking ? { status: next.to, trackingNumber: tracking } : { status: next.to }, `Order marked ${next.to}.`)}>
                {next.label}
              </Btn>
            ) : null}
            {order.status !== 'cancelled' && order.status !== 'delivered' ? (
              <Btn
                variant="danger"
                loading={busy}
                onClick={() =>
                  confirmAction(
                    order.paymentMethod === 'razorpay' && order.paymentStatus === 'paid'
                      ? 'Cancel this order? Stock is returned to inventory and points earned are removed. The online payment is NOT refunded automatically: refund it in the Razorpay dashboard.'
                      : 'Cancel this order? Stock is returned to inventory and points earned are removed.'
                  ) && patch({ status: 'cancelled' }, 'Order cancelled and stock restored.')
                }
              >
                Cancel order
              </Btn>
            ) : null}
          </>
        }
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          <Card title="Progress">
            <OrderTimeline order={order} />
          </Card>
          <Card title="Items" pad={false}>
            <ul className="divide-y divide-ink/5">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-parchment">{it.image ? <Image src={it.image} alt="" fill sizes="48px" className="object-cover" /> : null}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{it.title}</span>
                    <span className="text-xs text-stone">
                      {[it.size, it.color].filter(Boolean).join(' · ')} · {money(it.price)} × {it.quantity}
                    </span>
                  </span>
                  <span className="tabular-nums">{money(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-ink/10 px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone">Subtotal</dt>
                <dd className="tabular-nums">{money(order.subtotal)}</dd>
              </div>
              {order.discount ? (
                <div className="flex justify-between">
                  <dt className="text-stone">Discount {order.couponCode ? `(${order.couponCode})` : ''}</dt>
                  <dd className="tabular-nums">−{money(order.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-stone">Shipping · {order.shippingMethod}</dt>
                <dd className="tabular-nums">{order.shipping ? money(order.shipping) : 'Free'}</dd>
              </div>
              {order.tax ? (
                <div className="flex justify-between">
                  <dt className="text-stone">Tax</dt>
                  <dd className="tabular-nums">{money(order.tax)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between pt-2 text-base font-semibold">
                <dt>Total {order.paymentMethod === 'cod' ? '(pay on delivery)' : ''}</dt>
                <dd className="tabular-nums">{money(order.total)}</dd>
              </div>
            </dl>
          </Card>
          {order.notes ? (
            <Card title="Note from the customer">
              <p className="whitespace-pre-line text-sm">“{order.notes}”</p>
            </Card>
          ) : null}
          <Card title="Internal notes">
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} hint="Only staff see these. The customer never does." />
            <Btn size="sm" variant="outline" className="mt-3" loading={busy} onClick={() => patch({ adminNotes: notes || null }, 'Notes saved.')}>
              Save notes
            </Btn>
          </Card>
        </div>
        <div className="min-w-0 space-y-6">
          <Card title="Customer">
            <p>{order.customerName}</p>
            <a href={`mailto:${order.email}`} className="text-sm text-burgundy underline">
              {order.email}
            </a>
            <p className="mt-1 text-xs text-stone">{order.userId ? 'Registered customer' : 'Guest checkout'}</p>
            {order.pointsEarned ? <p className="mt-1 text-xs text-stone">{order.pointsEarned} loyalty points earned</p> : null}
          </Card>
          <Card title="Delivery address">
            <address className="text-sm not-italic leading-relaxed">
              {a.firstName} {a.lastName}
              <br />
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ''}
              <br />
              {a.city}, {a.state} {a.postalCode}
              <br />
              {a.country}
              {a.phone ? (
                <>
                  <br />
                  {a.phone}
                </>
              ) : null}
            </address>
          </Card>
          <Card title="Shipping">
            <Input label="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Carrier tracking number" />
            <Btn size="sm" variant="outline" className="mt-3" loading={busy} onClick={() => patch({ trackingNumber: tracking || null }, 'Tracking number saved.')}>
              Save tracking
            </Btn>
          </Card>
          <Card title="Payment">
            <p className="mb-3 text-sm">{order.paymentMethod === 'razorpay' ? 'Paid online through Razorpay' : order.paymentMethod === 'cod' ? 'Cash on delivery' : order.paymentMethod}</p>
            {order.paymentReference ? (
              <p className="mb-3 text-xs text-stone">
                Payment{' '}
                <a href={`https://dashboard.razorpay.com/app/payments/${encodeURIComponent(order.paymentReference)}`} target="_blank" rel="noreferrer" className="font-mono text-burgundy underline">
                  {order.paymentReference}
                </a>
                {order.paidAt ? ` · paid ${formatDate(order.paidAt, 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}
              </p>
            ) : null}
            {order.status === 'pending_payment' ? (
              <p className="text-xs text-stone">The customer is paying online. The order is placed automatically once Razorpay confirms the payment, or cancelled after 30 minutes without one.</p>
            ) : (
              <>
                <Select label="Payment status" value={order.paymentStatus} onChange={(e) => patch({ paymentStatus: e.target.value as PaymentStatus }, 'Payment status updated.')}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </Select>
                <p className="mt-2 text-xs text-stone">
                  {order.paymentMethod === 'razorpay'
                    ? 'Refunds are made in the Razorpay dashboard. With the webhook set up, a full refund there marks this order refunded on its own.'
                    : 'Pay-on-delivery orders are marked paid automatically when delivered.'}
                </p>
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  )
}

const RETURN_FLOW: ReturnStatus[] = ['pending', 'approved', 'received', 'refunded']

export function ReturnsAdmin({ returns }: { returns: (ReturnRequest & { email: string; customerName: string })[] }) {
  const money = useMoney()
  const { run, busy } = useMutate()
  const reasonLabel: Record<string, string> = { 'wrong-size': 'Wrong size', defective: 'Damaged / faulty', 'not-as-described': 'Not as described', 'changed-mind': 'Changed mind', other: 'Other' }
  return (
    <>
      <PageHeader title="Returns" description="Approve requests, then mark pieces received and refunded. Customers see each status in their account." />
      {returns.length ? (
        <div className="space-y-3">
          {returns.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs">{r.orderNumber}</p>
                  <p className="mt-1">
                    {r.customerName} · <a href={`mailto:${r.email}`} className="text-burgundy underline">{r.email}</a>
                  </p>
                  <p className="mt-1 text-sm text-stone">
                    {formatDate(r.createdAt)} · {reasonLabel[r.reason]} · {r.items.map((i) => `${i.quantity}× ${i.title}`).join(', ')}
                  </p>
                  {r.comments ? <p className="mt-2 rounded-lg bg-ink/[0.03] p-2 text-sm">“{r.comments}”</p> : null}
                </div>
                <div className="text-right">
                  <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                  <p className="mt-2 text-lg font-semibold tabular-nums">{money(r.refundAmount, { currency: r.currency })}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-4">
                {RETURN_FLOW.map((s) => (
                  <Btn key={s} size="sm" variant={r.status === s ? 'primary' : 'outline'} disabled={r.status === s} loading={busy} onClick={() => run('PATCH', `/api/admin/returns/${r.id}`, { status: s }, `Return marked ${s}.`)}>
                    {s}
                  </Btn>
                ))}
                <Btn size="sm" variant="danger" disabled={r.status === 'rejected'} loading={busy} onClick={() => run('PATCH', `/api/admin/returns/${r.id}`, { status: 'rejected' }, 'Return rejected.')}>
                  Reject
                </Btn>
                <Link href={`/admin/orders/${r.orderId}`} className="ml-auto self-center text-xs text-stone hover:text-ink">
                  Open order →
                </Link>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty title="No returns">Return requests from customers will appear here.</Empty>
      )}
    </>
  )
}
