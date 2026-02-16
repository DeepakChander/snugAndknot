'use client'

import { cn } from '@/lib/utils'

interface NotifyBadgeProps {
  count?: number
  className?: string
}

export default function NotifyBadge({ count, className }: NotifyBadgeProps) {
  const hasNotification = count !== undefined && count > 0

  return (
    <>
      <span
        className={cn(
          'relative inline-flex items-center justify-center w-7 h-7',
          className
        )}
        aria-label={
          hasNotification
            ? `${count} notification${count > 1 ? 's' : ''}`
            : 'No notifications'
        }
      >
        {/* Bell icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            'text-burgundy transition-colors duration-200',
            hasNotification && 'animate-[bell-ring_1.5s_ease-in-out_infinite]'
          )}
        >
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>

        {/* Notification dot / count */}
        {hasNotification && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 text-[8px] font-bold text-ivory rounded-full"
            style={{
              backgroundColor: 'var(--color-error-garnet)',
              animation: 'notify-pulse 2s ease-in-out infinite',
            }}
          >
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>

      <style jsx>{`
        @keyframes bell-ring {
          0%,
          100% {
            transform: rotate(0deg);
          }
          10% {
            transform: rotate(8deg);
          }
          20% {
            transform: rotate(-8deg);
          }
          30% {
            transform: rotate(6deg);
          }
          40% {
            transform: rotate(-4deg);
          }
          50% {
            transform: rotate(0deg);
          }
        }

        @keyframes notify-pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(155, 35, 53, 0.5);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(155, 35, 53, 0);
          }
        }
      `}</style>
    </>
  )
}
