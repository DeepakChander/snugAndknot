'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore } from '@/stores/auth-store'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import ordersData from '@/data/orders.json'
import type { Order, OrderStatus } from '@/types'

/* ──────────────────────────────────────────────────────────
   ORDERS LIST PAGE
   Displays all user orders with status badges,
   staggered entrance, and links to individual orders
   ────────────────────────────────────────────────────────── */

const orders = ordersData as Order[]

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  placed: {
    label: 'Placed',
    className: 'bg-gold/20 text-gold-muted border-gold/30',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-thread-gold/15 text-thread-gold border-thread-gold/30',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="22,4 12,14.01 9,11.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  shipped: {
    label: 'Shipped',
    className: 'bg-blush-wine/15 text-blush-wine border-blush-wine/30',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <polygon points="16,8 20,8 23,11 23,16 16,16" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  delivered: {
    label: 'Delivered',
    className: 'bg-success-moss/15 text-success-moss border-success-moss/30',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
        <polyline points="20,6 9,17 4,12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
}

export default function OrdersPage() {
  const { isAuthenticated, openAuthModal } = useAuthStore()

  // --------------------------------------------------
  // Unauthenticated state
  // --------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="pt-24 pb-32 bg-ivory min-h-screen">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto text-center py-24">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-burgundy/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-burgundy">
                <path d="M20 12V5.749a.6.6 0 00-.176-.425l-3.148-3.148A.6.6 0 0016.252 2H4.6a.6.6 0 00-.6.6v18.8a.6.6 0 00.6.6H11" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 2v3.4a.6.6 0 00.6.6H20" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl text-burgundy mb-3">
              Your Orders
            </h1>
            <p className="text-wine/70 mb-8 leading-relaxed">
              Sign in to view your order history and track your deliveries.
            </p>
            <button
              onClick={() => openAuthModal('login')}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold tracking-wider uppercase bg-burgundy text-gold hover:bg-burgundy-deep transition-all duration-300 hover:shadow-[0_8px_32px_-8px_rgba(91,14,20,0.4)]"
            >
              Sign In to View Orders
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --------------------------------------------------
  // Orders list
  // --------------------------------------------------
  return (
    <div className="pt-24 pb-32 bg-ivory min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <FadeIn>
          <nav className="flex items-center gap-2 text-xs text-wine/50 mb-8">
            <Link href="/account" className="hover:text-burgundy transition-colors">
              Account
            </Link>
            <span>/</span>
            <span className="text-burgundy">Orders</span>
          </nav>
        </FadeIn>

        {/* Header */}
        <div className="mb-10 lg:mb-14">
          <p className="text-xs font-semibold text-gold-muted uppercase tracking-[0.3em] mb-3">
            Order History
          </p>
          <TextReveal
            as="h1"
            className="text-4xl sm:text-5xl text-burgundy mb-3"
          >
            Your Orders
          </TextReveal>
          <FadeIn delay={0.15}>
            <p className="text-wine/70">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
            </p>
          </FadeIn>
        </div>

        {/* Empty state */}
        {orders.length === 0 ? (
          <FadeIn>
            <div className="text-center py-20 border border-gold-muted/20 bg-parchment/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-12 h-12 mx-auto mb-4 text-dust">
                <rect x="2" y="3" width="20" height="18" rx="2" />
                <path d="M8 7h8M8 11h5" strokeLinecap="round" />
              </svg>
              <p className="font-heading text-xl text-burgundy mb-2">No orders yet</p>
              <p className="text-sm text-wine/60 mb-6">
                Your order history will appear here once you make a purchase.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-7 py-3 text-sm font-semibold tracking-wider uppercase bg-burgundy text-gold hover:bg-burgundy-deep transition-all duration-300"
              >
                Start Shopping
              </Link>
            </div>
          </FadeIn>
        ) : (
          /* Orders list */
          <div className="space-y-5">
            {orders.map((order, i) => (
              <FadeIn key={order.id} delay={0.1 + i * 0.08}>
                <OrderCard order={order} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
   ORDER CARD
   Shows order number, date, status badge, total, item count
   ────────────────────────────────────────────────────────── */

function OrderCard({ order }: { order: Order }) {
  const status = statusConfig[order.status]
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const placedDate = new Date(order.placedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="group block border border-gold-muted/20 bg-ivory hover:bg-parchment/40 transition-all duration-300 hover:shadow-[0_8px_32px_-12px_rgba(91,14,20,0.08)]"
    >
      <div className="p-5 sm:p-6 lg:p-8">
        {/* Top row: Order number + Status badge */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-mono text-sm font-semibold text-burgundy">
              {order.orderNumber}
            </p>
            <p className="text-xs text-wine/50 mt-0.5">
              Placed {placedDate}
            </p>
          </div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wide uppercase border ${status.className}`}
          >
            {status.icon}
            {status.label}
          </div>
        </div>

        {/* Item thumbnails row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map((item, j) => (
              <div
                key={j}
                className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-ivory bg-parchment"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="w-12 h-12 rounded-full bg-burgundy/10 border-2 border-ivory flex items-center justify-center">
                <span className="text-xs font-semibold text-burgundy">
                  +{order.items.length - 3}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-wine/60">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Bottom row: Total + tracking info + arrow */}
        <div className="flex items-center justify-between pt-4 border-t border-gold-muted/15">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-wine/50 uppercase tracking-wider">Total</p>
              <p className="font-mono text-lg font-bold text-burgundy">
                ${order.total.toFixed(2)}
              </p>
            </div>
            {order.trackingNumber && (
              <div className="hidden sm:block">
                <p className="text-xs text-wine/50 uppercase tracking-wider">Tracking</p>
                <p className="text-xs font-mono text-wine/70">
                  {order.trackingNumber}
                </p>
              </div>
            )}
            {order.estimatedDelivery && order.status !== 'delivered' && (
              <div className="hidden sm:block">
                <p className="text-xs text-wine/50 uppercase tracking-wider">
                  Est. Delivery
                </p>
                <p className="text-xs text-wine/70">
                  {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-burgundy">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
