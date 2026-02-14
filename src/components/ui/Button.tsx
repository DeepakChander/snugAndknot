'use client'

import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-300 rounded-full',
        {
          'bg-charcoal text-cream hover:bg-espresso': variant === 'primary',
          'bg-terracotta text-cream hover:bg-terracotta-dark': variant === 'secondary',
          'border border-charcoal text-charcoal hover:bg-charcoal hover:text-cream': variant === 'outline',
          'text-walnut hover:text-charcoal': variant === 'ghost',
        },
        {
          'px-4 py-2 text-xs': size === 'sm',
          'px-6 py-2.5 text-sm': size === 'md',
          'px-8 py-3.5 text-base': size === 'lg',
        },
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
