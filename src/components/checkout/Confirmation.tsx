'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useAuthStore } from '@/stores/auth-store'
import { useMoney } from '@/components/providers/SettingsProvider'
import { ButtonLink } from '@/components/kit/Button'
import { LAST_ORDER_KEY } from './CheckoutView'
import type { Order } from '@/types/commerce'

const EASE = [0.16, 1, 0.3, 1] as const

export default function Confirmation({ orderNumber }: { orderNumber: string }) {
  const user = useAuthStore((s) => s.user)
  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  const money = useMoney(order?.currency)

  useEffect(() => {
    try {
      const o = JSON.parse(sessionStorage.getItem(LAST_ORDER_KEY) ?? 'null') as Order | null
      setOrder(o && o.orderNumber === orderNumber ? o : null)
    } catch {
      setOrder(null)
    }
  }, [orderNumber])

  if (order === undefined) return <div className="min-h-[100svh] bg-ivory" />

  if (!order) {
    return (
      <div className="min-h-[90svh] bg-ivory pt-nav text-ink">
        <div className="container-wide py-28 text-center">
          <h1 className="text-display">Thank you</h1>
          <p className="mx-auto mt-6 max-w-md text-stone">
            {orderNumber ? <>Order {orderNumber} is placed. </> : null}Track it any time with your order number and email.
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <ButtonLink href="/track" arrow>
              Track an order
            </ButtonLink>
            <ButtonLink href="/shop" variant="outline">
              Keep browsing
            </ButtonLink>
          </div>
        </div>
      </div>
    )
  }

  const a = order.shippingAddress
  const paidOnline = order.paymentMethod === 'razorpay' && order.paymentStatus === 'paid'
  // Razorpay took the payment but the server has not confirmed it yet (the webhook will).
  const confirming = order.paymentMethod === 'razorpay' && !paidOnline
  return (
    <>
      <section className="border-b border-ink/10 bg-ivory pb-14 pt-nav text-ink">
        <div className="container-wide pt-16 md:pt-24">
          <motion.svg viewBox="0 0 64 64" className="h-12 w-12 text-ink" aria-hidden initial="hidden" animate="show">
            <motion.circle cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="1.5" variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 1.2, ease: EASE } } }} />
            <motion.path d="M20 33 L28.5 41 L45 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.7, ease: EASE, delay: 0.9 } } }} />
          </motion.svg>
          <p className="mt-6 text-eyebrow text-stone">Order {order.orderNumber}</p>
          <h1 className="mt-3 text-display">{`Thank you, ${a.firstName}.`}</h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.6 }} className="mt-4 max-w-xl text-lead text-stone">
            {confirming ? (
              <>We are confirming your payment of {money(order.total)} with the bank. Please do not pay again: your order will show as placed on Track an order within a few minutes. If it does not, write to us with order number {order.orderNumber}.</>
            ) : paidOnline ? (
              <>Your order is in and your payment of {money(order.total)} is received. We will prepare it carefully and it will be sent to {a.city}.</>
            ) : (
              <>Your order is in. We will prepare it carefully and it will be sent to {a.city}. You will pay {money(order.total)} on delivery.</>
            )}
          </motion.p>
          {order.pointsEarned > 0 ? (
            <p className="mt-4 inline-flex bg-bone px-4 py-2 text-sm text-ink">
              {order.pointsGranted ? `+${order.pointsEarned} loyalty points added to your account` : `You will earn ${order.pointsEarned} loyalty points when it is delivered`}
            </p>
          ) : null}
        </div>
      </section>

      <section className="bg-ivory py-16 text-ink md:py-24">
        <div className="container-wide grid gap-12 lg:grid-cols-[1fr_420px]">
          <div>
            <h2 className="text-[1.25rem] font-medium">What happens next</h2>
            <ol className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                ['Confirmed', 'We review your order and confirm it with you.'],
                ['Shipped', 'Your parcel is on its way, with a tracking number.'],
                ['Delivered', order.paymentMethod === 'cod' ? 'Pay the courier on arrival. Returns open for the next weeks.' : 'Returns open for the next weeks.'],
              ].map(([t, d], i) => (
                <li key={t} className="border border-ink/10 p-6">
                  <span className="font-mono text-sm text-stone">{String(i + 1).padStart(2, '0')}</span>
                  <p className="mt-3 text-[1.05rem] font-medium">{t}</p>
                  <p className="mt-2 text-sm text-stone">{d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-wrap gap-3">
              {user ? (
                <ButtonLink href={`/account/orders/${order.id}`} arrow>
                  View order
                </ButtonLink>
              ) : (
                <ButtonLink href={`/track?order=${encodeURIComponent(order.orderNumber)}`} arrow>
                  Track this order
                </ButtonLink>
              )}
              <ButtonLink href="/shop" variant="outline">
                Continue shopping
              </ButtonLink>
            </div>
          </div>

          <aside className="bg-bone p-6 md:p-8">
            <h2 className="text-[1.25rem] font-medium">Your order</h2>
            <ul className="mt-6 space-y-4 border-b border-ink/10 pb-6">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center gap-4">
                  <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-parchment">{it.image ? <Image src={it.image} alt="" fill sizes="64px" className="object-cover" /> : null}</span>
                  <span className="min-w-0 flex-1">
                    <Link href={`/product/${it.handle}`} className="block truncate text-sm hover:underline">
                      {it.title}
                    </Link>
                    <span className="text-xs text-stone">
                      {[it.size, it.color].filter(Boolean).join(' · ')} × {it.quantity}
                    </span>
                  </span>
                  <span className="font-mono text-sm">{money(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone">Subtotal</dt>
                <dd className="font-mono">{money(order.subtotal)}</dd>
              </div>
              {order.discount ? (
                <div className="flex justify-between text-burgundy">
                  <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</dt>
                  <dd className="font-mono">−{money(order.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-stone">Shipping ({order.shippingMethod})</dt>
                <dd className="font-mono">{order.shipping ? money(order.shipping) : 'Free'}</dd>
              </div>
              {order.tax ? (
                <div className="flex justify-between">
                  <dt className="text-stone">Tax</dt>
                  <dd className="font-mono">{money(order.tax)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-ink/10 pt-3 text-base">
                <dt>{order.paymentMethod === 'cod' ? 'Total due on delivery' : paidOnline ? 'Total paid' : 'Total'}</dt>
                <dd className="font-mono text-xl">{money(order.total)}</dd>
              </div>
            </dl>
            <div className="mt-6 border-t border-ink/10 pt-6 text-sm">
              <p className="text-eyebrow text-stone">Delivering to</p>
              <address className="mt-2 not-italic leading-relaxed">
                {a.firstName} {a.lastName}
                <br />
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ''}
                <br />
                {a.city}, {a.state} {a.postalCode}
                <br />
                {a.country}
              </address>
              <p className="mt-3 text-stone">{order.email}</p>
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
