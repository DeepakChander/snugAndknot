'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ReturnRequest, ReturnStatus } from '@/types'
import FadeIn from '@/components/animation/FadeIn'
import TextReveal from '@/components/animation/TextReveal'

/* ------------------------------------------------
   Status badge color mapping
   ------------------------------------------------ */
const statusConfig: Record<ReturnStatus, { label: string; bg: string; text: string }> = {
  pending: {
    label: 'Pending',
    bg: 'bg-gold/20',
    text: 'text-gold-muted',
  },
  approved: {
    label: 'Approved',
    bg: 'bg-success-moss/15',
    text: 'text-success-moss',
  },
  shipped: {
    label: 'Shipped',
    bg: 'bg-burgundy/10',
    text: 'text-burgundy',
  },
  received: {
    label: 'Received',
    bg: 'bg-wine/15',
    text: 'text-wine',
  },
  refunded: {
    label: 'Refunded',
    bg: 'bg-success-moss/15',
    text: 'text-success-moss',
  },
}

/* ------------------------------------------------
   Component
   ------------------------------------------------ */
export default function ReturnsPage() {
  // Mock data -- starts empty; populated returns would come from API
  const [returns] = useState<ReturnRequest[]>([])

  return (
    <main className="page-content min-h-screen bg-ivory">
      <div className="max-w-4xl mx-auto px-5 lg:px-10 py-16 lg:py-24">

        {/* ---- Header ---- */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <TextReveal as="h1" className="font-heading text-4xl lg:text-5xl text-burgundy mb-2">
              Returns
            </TextReveal>
            <FadeIn delay={0.2}>
              <p className="text-burgundy/60">
                Manage your return requests and track their progress.
              </p>
            </FadeIn>
          </div>
          <FadeIn delay={0.25}>
            <Link
              href="/account/returns/new"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-burgundy text-gold rounded-full font-medium text-sm tracking-wide hover:bg-burgundy-deep transition-colors duration-300"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M3 10h10a5 5 0 015 5v2" />
                <path d="M7 14l-4-4 4-4" />
              </svg>
              Start a Return
            </Link>
          </FadeIn>
        </div>

        {/* ---- Returns List ---- */}
        {returns.length === 0 ? (
          /* Empty State */
          <FadeIn delay={0.3}>
            <div className="glass rounded-2xl border border-burgundy/8 p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-burgundy/5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-9 h-9 text-burgundy/30">
                  <path d="M3 10h10a5 5 0 015 5v2" />
                  <path d="M7 14l-4-4 4-4" />
                  <rect x="14" y="2" width="8" height="8" rx="1" strokeDasharray="3 3" />
                </svg>
              </div>
              <h2 className="font-heading text-2xl text-burgundy mb-2">
                No returns yet
              </h2>
              <p className="text-burgundy/50 max-w-sm mx-auto mb-8">
                If you need to return an item, you can start a new return request from your recent orders.
              </p>
              <Link
                href="/account/returns/new"
                className="inline-flex items-center gap-2 text-sm font-medium text-burgundy hover:text-gold-muted transition-colors"
              >
                Start a Return
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </FadeIn>
        ) : (
          /* Returns List */
          <div className="space-y-5">
            {returns.map((returnReq, i) => {
              const status = statusConfig[returnReq.status]
              return (
                <FadeIn key={returnReq.id} delay={0.2 + i * 0.08}>
                  <div className="glass rounded-xl border border-burgundy/8 p-6 hover:border-burgundy/15 transition-colors duration-300">
                    {/* Top row: order number + status */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-burgundy/40 mb-1">
                          Order
                        </p>
                        <p className="font-mono text-sm font-semibold text-burgundy">
                          {returnReq.orderNumber}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-3 mb-4">
                      {returnReq.items.map((item) => (
                        <div key={item.productId} className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-burgundy/5 overflow-hidden flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-burgundy truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-burgundy/40">
                              Size {item.size} &middot; {item.color} &middot; Qty {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer: refund amount + date */}
                    <div className="flex items-center justify-between pt-4 border-t border-burgundy/6">
                      <p className="text-xs text-burgundy/40">
                        Requested{' '}
                        {new Date(returnReq.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="font-mono text-sm font-semibold text-burgundy">
                        Refund: ${returnReq.refundAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        )}

        {/* ---- Back link ---- */}
        <FadeIn delay={0.4}>
          <div className="mt-10">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-sm text-burgundy/50 hover:text-burgundy transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Account
            </Link>
          </div>
        </FadeIn>
      </div>
    </main>
  )
}
