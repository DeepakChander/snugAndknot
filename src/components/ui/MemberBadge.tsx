'use client'

import { cn } from '@/lib/utils'

interface MemberBadgeProps {
  className?: string
}

export default function MemberBadge({ className }: MemberBadgeProps) {
  return (
    <>
      <span
        className={cn(
          'inline-flex items-center px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] rounded-full',
          className
        )}
        style={{
          background:
            'linear-gradient(110deg, #F1E194 0%, #FAF0C8 40%, #D4A843 50%, #FAF0C8 60%, #F1E194 100%)',
          backgroundSize: '200% 100%',
          animation: 'member-badge-shimmer 3s linear infinite',
          color: '#5B0E14',
        }}
      >
        Member Exclusive
      </span>

      <style jsx>{`
        @keyframes member-badge-shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </>
  )
}
