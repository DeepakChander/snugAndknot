'use client'

import { useAuthStore } from '@/stores/auth-store'
import { formatPrice } from '@/lib/utils'
import { LOYALTY_TIERS } from '@/types'

interface MemberPriceProps {
  price: number
  compareAtPrice?: number
}

export default function MemberPrice({ price, compareAtPrice }: MemberPriceProps) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const openAuthModal = useAuthStore((s) => s.openAuthModal)

  if (isAuthenticated && user) {
    const tierConfig = LOYALTY_TIERS[user.tier]
    const memberPrice = price * (1 - tierConfig.discount / 100)

    return (
      <div className="flex flex-col gap-1.5">
        {/* Member price badge with shimmer */}
        <span
          className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full"
          style={{
            background:
              'linear-gradient(110deg, #F1E194 0%, #FAF0C8 40%, #D4A843 50%, #FAF0C8 60%, #F1E194 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2.5s linear infinite',
            color: '#5B0E14',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          Member Price
        </span>

        {/* Price display */}
        <div className="flex items-baseline gap-2.5">
          <span className="font-mono text-xs text-dust line-through">
            {formatPrice(price)}
          </span>
          <span className="font-mono text-lg font-semibold text-gold-muted">
            {formatPrice(memberPrice)}
          </span>
        </div>

        {/* Compare at price if available */}
        {compareAtPrice && (
          <span className="font-mono text-[11px] text-dust line-through">
            RRP {formatPrice(compareAtPrice)}
          </span>
        )}

        {/* Tier info */}
        <p className="text-[11px] text-wine">
          {tierConfig.name} tier &mdash; {tierConfig.discount}% off
        </p>

        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}</style>
      </div>
    )
  }

  // Not authenticated -- show teaser
  const bestDiscount = LOYALTY_TIERS.tapestry.discount

  return (
    <div className="flex flex-col gap-1.5">
      {/* Regular price */}
      <div className="flex items-baseline gap-2.5">
        <span
          className="font-mono text-sm font-medium"
          style={{ color: compareAtPrice ? 'var(--color-gold)' : 'var(--color-wine)' }}
        >
          {formatPrice(price)}
        </span>
        {compareAtPrice && (
          <span className="font-mono text-xs text-dust line-through">
            {formatPrice(compareAtPrice)}
          </span>
        )}
      </div>

      {/* Member teaser */}
      <button
        onClick={() => openAuthModal('login')}
        className="group inline-flex items-center gap-1.5 self-start text-[11px] text-wine/80 hover:text-wine transition-colors duration-200"
        title="Sign in for exclusive pricing"
      >
        {/* Lock icon with hover rotation */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 group-hover:rotate-12"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <span>
          Members save up to {bestDiscount}%
        </span>
        <span className="text-gold-muted font-medium underline underline-offset-2">
          Sign in
        </span>
      </button>
    </div>
  )
}
