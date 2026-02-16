'use client'

import { useState } from 'react'
import { useUIStore } from '@/stores/ui-store'

interface BackInStockFormProps {
  productTitle: string
}

export default function BackInStockForm({ productTitle }: BackInStockFormProps) {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const addToast = useUIStore((s) => s.addToast)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 600))

    setIsLoading(false)
    setIsSubmitted(true)
    addToast(`We'll notify you when ${productTitle} is back!`)
  }

  if (isSubmitted) {
    return (
      <div className="flex items-center gap-2.5 py-3 px-4 bg-success-moss/10 border border-success-moss/20 rounded-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success-moss)" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <p className="text-sm text-success-moss">
          We will notify you at <span className="font-medium">{email}</span> when this item is back in stock.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-wine">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>Currently out of stock</span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-4 py-2.5 bg-transparent border border-silk rounded-sm text-sm text-burgundy placeholder:text-dust/60 focus:outline-none focus:border-gold transition-colors"
          aria-label="Email for back in stock notification"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="group relative inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border border-gold text-burgundy overflow-hidden rounded-sm transition-colors duration-400 hover:text-burgundy-deep disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 bg-gold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[var(--ease-yarn-pull)]" />
          <span className="relative z-10 flex items-center gap-2">
            {/* Bell Icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            {isLoading ? 'Sending...' : 'Notify Me'}
          </span>
        </button>
      </form>
    </div>
  )
}
