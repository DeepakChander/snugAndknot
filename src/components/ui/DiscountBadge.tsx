'use client'

import { cn } from '@/lib/utils'

interface DiscountBadgeProps {
  percentage: number
  className?: string
}

export default function DiscountBadge({ percentage, className }: DiscountBadgeProps) {
  return (
    <>
      <span
        className={cn(
          'inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-bold text-ivory rounded-full',
          className
        )}
        style={{
          backgroundColor: 'var(--color-error-garnet)',
          animation: 'discount-pulse 2s ease-in-out infinite',
        }}
      >
        -{Math.round(percentage)}%
      </span>

      <style jsx>{`
        @keyframes discount-pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  )
}
