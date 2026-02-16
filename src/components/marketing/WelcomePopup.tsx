'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import { useUIStore } from '@/stores/ui-store'

const STORAGE_KEY = 'snug-knot-popup-dismissed'
const DISMISS_DAYS = 7
const SHOW_DELAY_MS = 5000
const COUPON_CODE = 'WELCOME10'

export default function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const addToast = useUIStore((s) => s.addToast)
  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Check localStorage and show popup after delay
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      const now = Date.now()
      const daysSinceDismissed = (now - dismissedAt) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < DISMISS_DAYS) return
    }

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, SHOW_DELAY_MS)

    return () => clearTimeout(timer)
  }, [])

  // Entrance animation
  useEffect(() => {
    if (!isVisible || !panelRef.current || !backdropRef.current) return

    document.body.style.overflow = 'hidden'
    useUIStore.getState().lenisStop?.()

    gsap.fromTo(
      backdropRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: 'power2.out' }
    )
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, scale: 0.9, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'expo.out', delay: 0.1 }
    )

    return () => {
      document.body.style.overflow = ''
      useUIStore.getState().lenisStart?.()
    }
  }, [isVisible])

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
    document.body.style.overflow = ''
    useUIStore.getState().lenisStart?.()
    setIsVisible(false)
  }, [])

  // Close on Escape key
  useEffect(() => {
    if (!isVisible) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, handleDismiss])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    // Simulate storing email
    await new Promise((resolve) => setTimeout(resolve, 400))

    setIsSubmitted(true)
    addToast('Your 10% discount has been applied!')
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
  }

  const handleCopyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(COUPON_CODE)
      setIsCopied(true)
      addToast('Coupon code copied!')
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = COUPON_CODE
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setIsCopied(true)
      addToast('Coupon code copied!')
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={handleDismiss}
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          opacity: 0,
          background: 'linear-gradient(135deg, rgba(61,10,14,0.85) 0%, rgba(91,14,20,0.80) 50%, rgba(74,26,32,0.85) 100%)',
        }}
      />

      {/* Modal Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome discount offer"
        className="relative z-10 w-full max-w-md bg-ivory rounded-sm shadow-2xl overflow-hidden"
        style={{ opacity: 0 }}
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full text-dust hover:text-burgundy hover:bg-parchment/80 transition-colors"
          aria-label="Close popup"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="px-8 py-10 text-center">
          {/* Decorative Top Line */}
          <div className="w-12 h-0.5 bg-gold mx-auto mb-6" />

          {!isSubmitted ? (
            <>
              {/* Heading */}
              <h2 className="font-heading text-4xl text-gold mb-1" style={{ color: 'var(--color-gold)' }}>
                Get 10% Off
              </h2>
              <p className="font-heading text-lg text-burgundy mb-2">
                Your First Order
              </p>
              <p className="text-sm text-wine/70 mb-8 max-w-xs mx-auto leading-relaxed">
                Join our community and receive an exclusive welcome discount on luxury fashion essentials.
              </p>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full px-4 py-3 bg-transparent border border-silk rounded-sm text-sm text-burgundy placeholder:text-dust/50 focus:outline-none focus:border-gold transition-colors text-center"
                  aria-label="Email address for discount"
                />
                <button
                  type="submit"
                  className="group relative w-full py-3.5 text-sm font-semibold uppercase tracking-wider bg-burgundy text-gold-pale overflow-hidden transition-colors duration-500"
                >
                  <span className="absolute inset-0 bg-gold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[var(--ease-yarn-pull)]" />
                  <span className="relative z-10 group-hover:text-burgundy-deep transition-colors duration-500">
                    Claim My Discount
                  </span>
                </button>
              </form>

              {/* Dismiss Link */}
              <button
                onClick={handleDismiss}
                className="mt-4 text-xs text-dust hover:text-wine transition-colors underline underline-offset-2"
              >
                No thanks, I prefer full price
              </button>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="py-2">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-moss)" strokeWidth="1.5" className="mx-auto mb-4">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="16 9 10.5 14.5 8 12" />
                </svg>
                <h3 className="font-heading text-2xl text-burgundy mb-2">
                  Your Discount is Ready
                </h3>
                <p className="text-sm text-wine/70 mb-6">
                  Use this code at checkout for 10% off your first order:
                </p>

                {/* Coupon Code */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="px-5 py-3 bg-parchment border-2 border-dashed border-gold font-mono text-lg font-bold text-burgundy tracking-widest">
                    {COUPON_CODE}
                  </span>
                  <button
                    onClick={handleCopyCoupon}
                    className="px-4 py-3 bg-burgundy text-gold-pale text-xs font-semibold uppercase tracking-wider hover:bg-burgundy-deep transition-colors"
                    aria-label="Copy coupon code"
                  >
                    {isCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <button
                  onClick={handleDismiss}
                  className="text-sm text-burgundy font-medium hover:text-wine transition-colors underline underline-offset-2"
                >
                  Start Shopping
                </button>
              </div>
            </>
          )}

          {/* Decorative Bottom Line */}
          <div className="w-12 h-0.5 bg-gold mx-auto mt-6" />
        </div>
      </div>
    </div>
  )
}
