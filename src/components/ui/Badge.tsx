import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'sale' | 'new' | 'bestseller'
  className?: string
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full',
        {
          'bg-cream-dark text-walnut': variant === 'default',
          'bg-terracotta text-cream': variant === 'sale',
          'bg-sage text-cream': variant === 'new',
          'bg-charcoal text-cream': variant === 'bestseller',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
