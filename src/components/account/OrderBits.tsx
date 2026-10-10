'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useMoney } from '@/components/providers/SettingsProvider'
import { cn, formatDate } from '@/lib/format'
import type { Order, OrderStatus, ReturnStatus } from '@/types/commerce'

const STATUS_STYLE: Record<string, string> = {
  placed: 'bg-gold/20 text-gold-deep',
  confirmed: 'bg-sage/20 text-success',
  shipped: 'bg-ink/10 text-ink',
  delivered: 'bg-success/15 text-success',
  cancelled: 'bg-error/10 text-error',
  pending: 'bg-gold/20 text-gold-deep',
  approved: 'bg-success/15 text-success',
  rejected: 'bg-error/10 text-error',
  received: 'bg-ink/10 text-ink',
  refunded: 'bg-success/15 text-success',
}

export function StatusPill({ status }: { status: OrderStatus | ReturnStatus | string }) {
  return <span className={cn('inline-flex rounded-full px-3 py-1 text-eyebrow', STATUS_STYLE[status] ?? 'bg-ink/10')}>{status}</span>
}

const STEPS: { id: OrderStatus; label: string; key: keyof Order }[] = [
  { id: 'placed', label: 'Placed', key: 'placedAt' },
  { id: 'confirmed', label: 'Confirmed', key: 'confirmedAt' },
  { id: 'shipped', label: 'Shipped', key: 'shippedAt' },
  { id: 'delivered', label: 'Delivered', key: 'deliveredAt' },
]

/** Placed → confirmed → shipped → delivered, with the real timestamps. */
export function OrderTimeline({ order, tone = 'light' }: { order: Order; tone?: 'light' | 'dark' }) {
  if (order.status === 'cancelled') {
    return (
      <p className="rounded-2xl bg-error/10 p-4 text-sm text-error">
        This order was cancelled{order.cancelledAt ? ` on ${formatDate(order.cancelledAt)}` : ''}.
      </p>
    )
  }
  const reached = STEPS.findIndex((s) => s.id === order.status)
  return (
    <ol className="relative grid grid-cols-4">
      <span className={cn('absolute left-[12.5%] right-[12.5%] top-[11px] h-px', tone === 'light' ? 'bg-ink/10' : 'bg-bone/15')} aria-hidden />
      <motion.span
        className="absolute left-[12.5%] top-[11px] h-px origin-left bg-gold"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: reached / (STEPS.length - 1) }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        style={{ width: '75%' }}
        aria-hidden
      />
      {STEPS.map((s, i) => {
        const done = i <= reached
        const at = order[s.key] as string | null
        return (
          <li key={s.id} className="relative flex flex-col items-center text-center">
            <span className={cn('relative z-[1] flex h-6 w-6 items-center justify-center rounded-full border transition-colors', done ? 'border-gold bg-gold text-ink' : tone === 'light' ? 'border-ink/20 bg-ivory' : 'border-bone/20 bg-noir')}>
              {done ? (
                <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
                  <path d="M2.5 6.5 5 9l4.5-5.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                </svg>
              ) : null}
            </span>
            <span className={cn('mt-3 text-sm', done ? '' : 'opacity-50')}>{s.label}</span>
            <span className="mt-0.5 text-xs opacity-50">{at ? formatDate(at, 'en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
          </li>
        )
      })}
    </ol>
  )
}

export function OrderLines({ order }: { order: Order }) {
  const money = useMoney()
  return (
    <ul className="divide-y divide-current/10">
      {order.items.map((it) => (
        <li key={it.id} className="flex items-center gap-4 py-4">
          <span className="relative h-24 w-[4.5rem] shrink-0 overflow-hidden rounded-xl bg-parchment">{it.image ? <Image src={it.image} alt="" fill sizes="72px" className="object-cover" /> : null}</span>
          <span className="min-w-0 flex-1">
            <Link href={`/product/${it.handle}`} className="font-display text-xl leading-tight hover:text-burgundy">
              {it.title}
            </Link>
            <span className="mt-1 block text-xs opacity-60">
              {[it.size, it.color].filter(Boolean).join(' · ')} · Qty {it.quantity}
            </span>
          </span>
          <span className="font-mono text-sm">{money(it.price * it.quantity)}</span>
        </li>
      ))}
    </ul>
  )
}

export function OrderTotals({ order }: { order: Order }) {
  const money = useMoney()
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between">
        <dt className="opacity-60">Subtotal</dt>
        <dd className="font-mono">{money(order.subtotal)}</dd>
      </div>
      {order.discount ? (
        <div className="flex justify-between text-burgundy">
          <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</dt>
          <dd className="font-mono">−{money(order.discount)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between">
        <dt className="opacity-60">Shipping · {order.shippingMethod}</dt>
        <dd className="font-mono">{order.shipping ? money(order.shipping) : 'Free'}</dd>
      </div>
      {order.tax ? (
        <div className="flex justify-between">
          <dt className="opacity-60">Tax</dt>
          <dd className="font-mono">{money(order.tax)}</dd>
        </div>
      ) : null}
      <div className="flex justify-between border-t border-current/10 pt-3 text-base">
        <dt>Total</dt>
        <dd className="font-mono text-lg">{money(order.total)}</dd>
      </div>
      <div className="flex justify-between text-xs opacity-60">
        <dt>Payment</dt>
        <dd>
          {order.paymentMethod === 'cod' ? 'Pay on delivery' : order.paymentMethod} · {order.paymentStatus}
        </dd>
      </div>
    </dl>
  )
}

export function AddressBlock({ order }: { order: Order }) {
  const a = order.shippingAddress
  return (
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
  )
}
