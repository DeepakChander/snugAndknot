'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function OrderConfirmation({
  orderNumber,
  onReset,
}: {
  orderNumber: string
  onReset: () => void
}) {
  const [showCheck, setShowCheck] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setShowCheck(true), 300)
    const t2 = setTimeout(() => setShowContent(true), 800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated Checkmark */}
        <div className="relative mx-auto mb-8 w-24 h-24">
          <div
            className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ease-[var(--ease-loom-settle)] ${
              showCheck
                ? 'border-success-moss scale-100 opacity-100'
                : 'border-transparent scale-50 opacity-0'
            }`}
          />
          <div
            className={`absolute inset-0 rounded-full bg-success-moss/10 transition-all duration-500 delay-200 ${
              showCheck ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
          />
          <svg
            className={`absolute inset-0 m-auto text-success-moss transition-all duration-500 delay-300 ${
              showCheck ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            }`}
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        {/* Content */}
        <div
          className={`transition-all duration-700 ease-[var(--ease-loom-settle)] ${
            showContent
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-6'
          }`}
        >
          <h1 className="font-heading text-3xl sm:text-4xl text-burgundy mb-3">
            Thank You!
          </h1>
          <p className="text-wine mb-6">
            Your order has been placed successfully.
          </p>

          <div className="inline-block px-6 py-4 bg-parchment rounded-xl border border-silk mb-8">
            <p className="text-xs text-rosewood uppercase tracking-wider mb-1">
              Order Number
            </p>
            <p className="font-mono text-2xl text-burgundy font-semibold tracking-wider">
              {orderNumber}
            </p>
          </div>

          <p className="text-sm text-rosewood mb-8">
            We&apos;ll send a confirmation email with your order details and
            tracking information.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/shop"
              onClick={onReset}
              className="px-8 py-3.5 bg-burgundy text-gold-pale text-sm font-medium rounded-full hover:bg-burgundy-deep transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account/orders"
              className="px-8 py-3.5 text-burgundy text-sm font-medium rounded-full border border-burgundy hover:bg-burgundy hover:text-gold-pale transition-colors"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
