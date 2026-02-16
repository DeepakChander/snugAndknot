'use client'

import { useState, useRef } from 'react'
import { useUIStore } from '@/stores/ui-store'
import coupons from '@/data/coupons.json'
import type { Coupon } from '@/types'

interface CouponInputProps {
  subtotal: number
  appliedCoupon: Coupon | null
  onApply: (coupon: Coupon, discount: number) => void
  onRemove: () => void
}

export default function CouponInput({
  subtotal,
  appliedCoupon,
  onApply,
  onRemove,
}: CouponInputProps) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const addToast = useUIStore((s) => s.addToast)

  const handleApply = () => {
    if (!code.trim()) return

    const normalizedCode = code.trim().toUpperCase()
    const coupon = (coupons as Coupon[]).find(
      (c) => c.code === normalizedCode
    )

    if (!coupon) {
      setError('Invalid coupon code')
      triggerShake()
      return
    }

    // Check expiration
    if (new Date(coupon.expiresAt) < new Date()) {
      setError('This coupon has expired')
      triggerShake()
      return
    }

    // Check minimum purchase
    if (subtotal < coupon.minPurchase) {
      setError(
        `Minimum purchase of $${coupon.minPurchase} required`
      )
      triggerShake()
      return
    }

    // Calculate discount
    const discount =
      coupon.type === 'percentage'
        ? (subtotal * coupon.value) / 100
        : coupon.value

    onApply(coupon, discount)
    setCode('')
    setError('')
    addToast(`Coupon "${coupon.code}" applied!`, 'success')
  }

  const triggerShake = () => {
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 500)
  }

  const handleRemove = () => {
    onRemove()
    setCode('')
    setError('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleApply()
    }
  }

  return (
    <div className="space-y-3">
      {!appliedCoupon ? (
        <>
          <div
            className={`flex gap-2 ${
              isShaking ? 'animate-shake' : ''
            }`}
          >
            <input
              ref={inputRef}
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                if (error) setError('')
              }}
              onKeyDown={handleKeyDown}
              placeholder="Coupon code"
              className="flex-1 px-4 py-2.5 bg-ivory border border-dust rounded-lg text-sm text-burgundy placeholder:text-dust focus:outline-none focus:border-burgundy transition-colors font-mono uppercase tracking-wider"
              aria-label="Coupon code"
              aria-describedby={error ? 'coupon-error' : undefined}
            />
            <button
              onClick={handleApply}
              disabled={!code.trim()}
              className="px-5 py-2.5 bg-burgundy text-gold-pale text-sm font-medium rounded-lg hover:bg-burgundy-deep transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Apply
            </button>
          </div>

          {error && (
            <p
              id="coupon-error"
              className="text-xs text-error-garnet flex items-center gap-1.5"
              role="alert"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </p>
          )}
        </>
      ) : (
        <div className="flex items-center justify-between px-4 py-2.5 bg-success-moss/10 border border-success-moss/30 rounded-lg">
          <div className="flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-success-moss shrink-0"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <div>
              <span className="text-sm font-mono font-medium text-burgundy">
                {appliedCoupon.code}
              </span>
              <span className="text-xs text-wine ml-2">
                {appliedCoupon.description}
              </span>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="ml-3 p-1 text-rosewood hover:text-error-garnet transition-colors"
            aria-label={`Remove coupon ${appliedCoupon.code}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

    </div>
  )
}
