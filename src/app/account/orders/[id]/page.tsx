'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import gsap from 'gsap'
import ordersData from '@/data/orders.json'
import { formatPrice, formatDate } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

/* ─────────────── Constants ─────────────── */
const orders = ordersData as Order[]

const MILESTONES: { key: OrderStatus; label: string }[] = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

const STATUS_INDEX: Record<OrderStatus, number> = {
  placed: 0,
  confirmed: 1,
  shipped: 2,
  delivered: 3,
}

/* ─────────────── Main Page ─────────────── */
export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params.id as string
  const order = orders.find((o) => o.id === orderId)
  const timelineRef = useRef<HTMLDivElement>(null)
  const progressLineRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // GSAP timeline animation
  useEffect(() => {
    if (!mounted || !order || !progressLineRef.current) return

    const currentIndex = STATUS_INDEX[order.status]
    const progressPercent = (currentIndex / (MILESTONES.length - 1)) * 100

    // Animate the progress line fill
    const ctx = gsap.context(() => {
      // Desktop: animate width. Mobile: animate height.
      const mm = gsap.matchMedia()

      mm.add('(min-width: 768px)', () => {
        gsap.fromTo(
          progressLineRef.current,
          { width: '0%' },
          {
            width: `${progressPercent}%`,
            duration: 1.2,
            ease: 'power2.out',
            delay: 0.3,
          }
        )
      })

      mm.add('(max-width: 767px)', () => {
        gsap.fromTo(
          progressLineRef.current,
          { height: '0%' },
          {
            height: `${progressPercent}%`,
            duration: 1.2,
            ease: 'power2.out',
            delay: 0.3,
          }
        )
      })

      // Animate milestone dots
      const dots = timelineRef.current?.querySelectorAll('.milestone-dot')
      if (dots) {
        dots.forEach((dot, i) => {
          if (i <= currentIndex) {
            gsap.fromTo(
              dot,
              { scale: 0, opacity: 0 },
              {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: 'back.out(2)',
                delay: 0.4 + i * 0.2,
              }
            )
          }
        })
      }
    }, timelineRef)

    return () => ctx.revert()
  }, [mounted, order])

  if (!mounted) return null

  // ─── Not Found ───
  if (!order) {
    return (
      <div className="min-h-screen bg-ivory pt-24 pb-20 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-burgundy/10 flex items-center justify-center">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-burgundy"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <h1 className="font-heading text-3xl text-burgundy mb-3">
            Order Not Found
          </h1>
          <p className="text-wine mb-8">
            We couldn&apos;t find the order you&apos;re looking for.
          </p>
          <Link
            href="/account/orders"
            className="inline-flex px-8 py-3.5 bg-burgundy text-gold-pale text-sm font-medium rounded-full hover:bg-burgundy-deep transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    )
  }

  const currentStatusIndex = STATUS_INDEX[order.status]

  const getDateForMilestone = (milestone: OrderStatus): string | null => {
    switch (milestone) {
      case 'placed':
        return order.placedAt || null
      case 'confirmed':
        return order.confirmedAt || null
      case 'shipped':
        return order.shippedAt || null
      case 'delivered':
        return order.deliveredAt || null
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-ivory pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Breadcrumb ─── */}
        <nav className="flex items-center gap-2 text-xs text-wine/50 mb-8">
          <Link
            href="/account"
            className="hover:text-burgundy transition-colors"
          >
            Account
          </Link>
          <span>/</span>
          <Link
            href="/account/orders"
            className="hover:text-burgundy transition-colors"
          >
            Orders
          </Link>
          <span>/</span>
          <span className="text-burgundy font-mono">{order.orderNumber}</span>
        </nav>

        {/* ─── Header ─── */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold text-gold-muted uppercase tracking-[0.3em] mb-2">
              Order Details
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-burgundy">
              {order.orderNumber}
            </h1>
            <p className="text-sm text-wine mt-2">
              Placed on {formatDate(order.placedAt)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* ─── Status Timeline ─── */}
        <div
          ref={timelineRef}
          className="mb-12 p-6 sm:p-8 rounded-xl bg-parchment border border-silk"
        >
          <h2 className="text-sm font-medium text-burgundy uppercase tracking-wider mb-8">
            Order Progress
          </h2>

          {/* Desktop Timeline (horizontal) */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Background line */}
              <div className="absolute top-5 left-[calc(0%+18px)] right-[calc(0%+18px)] h-[3px] bg-dust/30 rounded-full" />
              {/* Filled progress line */}
              <div
                ref={progressLineRef}
                className="absolute top-5 left-[calc(0%+18px)] h-[3px] bg-gold rounded-full"
                style={{ width: '0%' }}
              />

              <div className="relative flex justify-between">
                {MILESTONES.map((milestone, i) => {
                  const isActive = i <= currentStatusIndex
                  const isCurrent = i === currentStatusIndex
                  const date = getDateForMilestone(milestone.key)

                  return (
                    <div
                      key={milestone.key}
                      className="flex flex-col items-center w-1/4"
                    >
                      {/* Dot */}
                      <div
                        className={`milestone-dot relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-gold text-burgundy-deep'
                            : 'bg-dust/30 text-rosewood'
                        } ${isCurrent ? 'ring-4 ring-gold/30' : ''}`}
                        style={{ opacity: isActive ? 1 : 0.5 }}
                      >
                        {isActive ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span className="text-xs font-medium">{i + 1}</span>
                        )}
                      </div>

                      {/* Label */}
                      <p
                        className={`text-sm font-medium mt-3 ${
                          isActive ? 'text-burgundy' : 'text-dust'
                        }`}
                      >
                        {milestone.label}
                      </p>

                      {/* Date */}
                      {date ? (
                        <p className="text-xs text-rosewood mt-1">
                          {new Date(date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      ) : (
                        <p className="text-xs text-dust/60 mt-1">Pending</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Mobile Timeline (vertical) */}
          <div className="md:hidden">
            <div className="relative pl-8">
              {/* Background line */}
              <div className="absolute left-[15px] top-5 bottom-5 w-[3px] bg-dust/30 rounded-full" />
              {/* Filled progress line */}
              <div
                ref={progressLineRef}
                className="absolute left-[15px] top-5 w-[3px] bg-gold rounded-full"
                style={{ height: '0%' }}
              />

              <div className="space-y-8">
                {MILESTONES.map((milestone, i) => {
                  const isActive = i <= currentStatusIndex
                  const isCurrent = i === currentStatusIndex
                  const date = getDateForMilestone(milestone.key)

                  return (
                    <div key={milestone.key} className="relative flex gap-4">
                      {/* Dot */}
                      <div
                        className={`milestone-dot absolute left-[-24px] w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          isActive
                            ? 'bg-gold text-burgundy-deep'
                            : 'bg-dust/30 text-rosewood'
                        } ${isCurrent ? 'ring-4 ring-gold/30' : ''}`}
                        style={{ opacity: isActive ? 1 : 0.5 }}
                      >
                        {isActive ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <span className="text-[10px] font-medium">{i + 1}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="pt-1">
                        <p
                          className={`text-sm font-medium ${
                            isActive ? 'text-burgundy' : 'text-dust'
                          }`}
                        >
                          {milestone.label}
                        </p>
                        {date ? (
                          <p className="text-xs text-rosewood mt-0.5">
                            {new Date(date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        ) : (
                          <p className="text-xs text-dust/60 mt-0.5">Pending</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Estimated delivery */}
          {order.estimatedDelivery && order.status !== 'delivered' && (
            <div className="mt-6 pt-6 border-t border-silk flex items-center gap-2 text-sm text-wine">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Estimated delivery:{' '}
              <span className="font-medium text-burgundy">
                {formatDate(order.estimatedDelivery)}
              </span>
            </div>
          )}
        </div>

        {/* ─── Content Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Order Items */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-medium text-burgundy uppercase tracking-wider mb-5">
              Items ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 sm:p-5 rounded-xl bg-parchment border border-silk"
                >
                  <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg overflow-hidden bg-ivory shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={96}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.handle}`}
                      className="text-sm font-medium text-burgundy hover:text-wine transition-colors"
                    >
                      {item.title}
                    </Link>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                      {item.size && (
                        <p className="text-xs text-rosewood">
                          Size: {item.size}
                        </p>
                      )}
                      {item.color && (
                        <p className="text-xs text-rosewood">
                          Color: {item.color}
                        </p>
                      )}
                      <p className="text-xs text-rosewood">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-mono text-sm font-medium text-burgundy mt-2">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Details Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shipping Address */}
            <div className="p-5 rounded-xl bg-parchment border border-silk">
              <h3 className="text-sm font-medium text-burgundy uppercase tracking-wider mb-3">
                Shipping Address
              </h3>
              <div className="text-sm text-wine leading-relaxed">
                <p className="font-medium text-burgundy">
                  {order.shippingAddress.name}
                </p>
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zip}
                </p>
                <p>{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && (
                  <p className="mt-1 text-xs text-rosewood">
                    {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Tracking */}
            {order.trackingNumber && (
              <div className="p-5 rounded-xl bg-parchment border border-silk">
                <h3 className="text-sm font-medium text-burgundy uppercase tracking-wider mb-3">
                  Tracking Number
                </h3>
                <div className="flex items-center gap-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-wine shrink-0"
                  >
                    <rect x="1" y="3" width="15" height="13" rx="1" />
                    <polygon points="16,8 20,8 23,11 23,16 16,16" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  <p className="font-mono text-sm text-burgundy break-all">
                    {order.trackingNumber}
                  </p>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="p-5 rounded-xl bg-parchment border border-silk">
              <h3 className="text-sm font-medium text-burgundy uppercase tracking-wider mb-4">
                Summary
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-wine">Subtotal</span>
                  <span className="font-mono text-burgundy">
                    {formatPrice(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-wine">Shipping</span>
                  <span className="font-mono text-burgundy">
                    {order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-success-moss">Discount</span>
                    <span className="font-mono text-success-moss">
                      -{formatPrice(order.discount)}
                    </span>
                  </div>
                )}
                <div className="border-t border-dust pt-2.5 flex justify-between">
                  <span className="font-medium text-burgundy">Total</span>
                  <span className="font-mono text-lg text-burgundy font-semibold">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Need Help */}
            <div className="p-5 rounded-xl bg-burgundy/5 border border-burgundy/10">
              <h3 className="text-sm font-medium text-burgundy mb-2">
                Need Help?
              </h3>
              <p className="text-xs text-wine leading-relaxed mb-3">
                If you have questions about your order or need assistance, our
                support team is here to help.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-sm text-burgundy font-medium hover:text-wine transition-colors"
              >
                Contact Support
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Status Badge
   ═══════════════════════════════════════════ */
function StatusBadge({ status }: { status: OrderStatus }) {
  const config: Record<
    OrderStatus,
    { label: string; className: string }
  > = {
    placed: {
      label: 'Placed',
      className: 'bg-gold/20 text-gold-muted border-gold/30',
    },
    confirmed: {
      label: 'Confirmed',
      className: 'bg-thread-gold/15 text-thread-gold border-thread-gold/30',
    },
    shipped: {
      label: 'Shipped',
      className: 'bg-blush-wine/15 text-blush-wine border-blush-wine/30',
    },
    delivered: {
      label: 'Delivered',
      className: 'bg-success-moss/15 text-success-moss border-success-moss/30',
    },
  }

  const { label, className } = config[status]

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase border rounded-full ${className}`}
    >
      {status === 'delivered' && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {label}
    </span>
  )
}
