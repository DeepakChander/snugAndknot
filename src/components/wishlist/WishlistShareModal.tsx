'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useUIStore } from '@/stores/ui-store'

interface WishlistShareModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WishlistShareModal({ isOpen, onClose }: WishlistShareModalProps) {
  const items = useWishlistStore((s) => s.items)
  const addToast = useUIStore((s) => s.addToast)
  const [copied, setCopied] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const url = new URL(window.location.origin + '/wishlist')
      url.searchParams.set('items', items.join(','))
      setShareUrl(url.toString())
      setCopied(false)
    }
  }, [isOpen, items])

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      addToast('Link copied to clipboard', 'success')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      addToast('Failed to copy link', 'error')
    }
  }, [shareUrl, addToast])

  const twitterUrl = `https://twitter.com/intent/tweet?text=Check%20out%20my%20wishlist!&url=${encodeURIComponent(shareUrl)}`
  const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=My%20Snug%20%26%20Knot%20Wishlist`
  const emailUrl = `mailto:?subject=My%20Snug%20%26%20Knot%20Wishlist&body=Check%20out%20my%20wishlist%3A%20${encodeURIComponent(shareUrl)}`

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-noir/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal card -- glass morphism */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-silk/30 p-6 shadow-2xl"
        style={{
          background: 'rgba(253, 248, 236, 0.85)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Share wishlist"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-burgundy/60 hover:text-burgundy hover:bg-burgundy/10 transition-colors duration-200"
          aria-label="Close share modal"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-5">
          <h3 className="text-lg font-heading font-semibold text-burgundy">
            Share Your Wishlist
          </h3>
          <p className="mt-1 text-xs text-wine/70">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your wishlist
          </p>
        </div>

        {/* URL field + copy button */}
        <div className="flex items-stretch gap-2 mb-6">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 min-w-0 px-3 py-2 text-xs font-mono text-burgundy bg-ivory border border-silk rounded-lg truncate focus:outline-none focus:ring-2 focus:ring-gold"
            aria-label="Shareable wishlist URL"
          />
          <button
            onClick={handleCopy}
            className="relative shrink-0 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-300 overflow-hidden"
            style={{
              backgroundColor: copied ? 'var(--color-success-moss)' : 'var(--color-burgundy)',
              color: copied ? 'var(--color-ivory)' : 'var(--color-gold-pale)',
            }}
          >
            <span
              className="flex items-center gap-1.5 transition-transform duration-300"
              style={{
                transform: copied ? 'translateY(-100%)' : 'translateY(0)',
                opacity: copied ? 0 : 1,
              }}
            >
              Copy Link
            </span>
            {/* Checkmark animation */}
            <span
              className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
              style={{
                transform: copied ? 'translateY(0)' : 'translateY(100%)',
                opacity: copied ? 1 : 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  animation: copied ? 'checkmark-draw 0.35s ease-out forwards' : 'none',
                }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-silk" />
          <span className="text-[10px] text-dust uppercase tracking-wider">or share via</span>
          <div className="flex-1 h-px bg-silk" />
        </div>

        {/* Social share buttons */}
        <div className="flex items-center justify-center gap-3">
          {/* Twitter / X */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-11 h-11 rounded-full bg-burgundy/8 text-burgundy hover:bg-burgundy hover:text-gold-pale transition-all duration-300"
            aria-label="Share on Twitter"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* Pinterest */}
          <a
            href={pinterestUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-11 h-11 rounded-full bg-burgundy/8 text-burgundy hover:bg-burgundy hover:text-gold-pale transition-all duration-300"
            aria-label="Share on Pinterest"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
            </svg>
          </a>

          {/* Email */}
          <a
            href={emailUrl}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-burgundy/8 text-burgundy hover:bg-burgundy hover:text-gold-pale transition-all duration-300"
            aria-label="Share via email"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 4L12 13 2 4" />
            </svg>
          </a>
        </div>
      </div>

      <style jsx>{`
        @keyframes checkmark-draw {
          0% {
            stroke-dasharray: 30;
            stroke-dashoffset: 30;
          }
          100% {
            stroke-dasharray: 30;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )
}
