'use client'

import Link from 'next/link'
import { forwardRef, type ComponentPropsWithoutRef, type PointerEvent, type ReactNode } from 'react'
import { cn } from '@/lib/format'
import Magnetic from '@/components/motion/Magnetic'

type Variant = 'primary' | 'light' | 'outline' | 'outline-light' | 'gold' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const VARIANT: Record<Variant, string> = {
  primary: 'bg-ink text-ivory [--btn-fill:var(--color-burgundy)] [--btn-ink-hover:var(--color-ivory)]',
  light: 'bg-ivory text-ink [--btn-fill:var(--color-gold)] [--btn-ink-hover:var(--color-ink)]',
  gold: 'bg-gold text-ink [--btn-fill:var(--color-ink)] [--btn-ink-hover:var(--color-gold-light)]',
  outline: 'border border-ink/25 text-ink [--btn-fill:var(--color-ink)] [--btn-ink-hover:var(--color-ivory)]',
  'outline-light': 'border border-ivory/30 text-ivory [--btn-fill:var(--color-ivory)] [--btn-ink-hover:var(--color-ink)]',
  ghost: 'text-current [--btn-fill:color-mix(in_srgb,currentColor_10%,transparent)] [--btn-ink-hover:currentColor]',
}

const SIZE: Record<Size, string> = {
  sm: 'h-10 px-5 text-[0.8125rem]',
  md: 'h-12 px-7 text-sm',
  lg: 'h-14 px-9 text-[0.95rem]',
}

export function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={cn('h-3.5 w-3.5', className)}>
      <path d="M3 13 13 3M13 3H5.5M13 3v7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="2.5" fill="none" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function setFillOrigin(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--fx', `${((e.clientX - r.left) / r.width) * 100}%`)
  el.style.setProperty('--fy', `${((e.clientY - r.top) / r.height) * 100}%`)
}

type Common = {
  variant?: Variant
  size?: Size
  arrow?: boolean
  icon?: ReactNode
  loading?: boolean
  magnetic?: boolean
  block?: boolean
  className?: string
  children: ReactNode
}

function Inner({ children, arrow, icon, loading }: Pick<Common, 'children' | 'arrow' | 'icon' | 'loading'>) {
  const label = typeof children === 'string' ? children : null
  return (
    <>
      <span className="btn-fill" aria-hidden />
      {loading ? <Spinner /> : null}
      {label ? (
        <span className="roll font-medium tracking-[-0.01em]">
          <span data-text={label}>{label}</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-2 font-medium">{children}</span>
      )}
      {icon ?? (arrow ? <Arrow className="btn-icon" /> : null)}
    </>
  )
}

type ButtonProps = Common & Omit<ComponentPropsWithoutRef<'button'>, 'children'>

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', arrow, icon, loading, magnetic, block, className, children, disabled, type = 'button', ...rest },
  ref
) {
  const el = (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-cursor="hover"
      onPointerEnter={setFillOrigin}
      onPointerLeave={setFillOrigin}
      className={cn('btn group', VARIANT[variant], SIZE[size], block && 'w-full', className)}
      {...rest}
    >
      <Inner arrow={arrow} icon={icon} loading={loading}>
        {children}
      </Inner>
    </button>
  )
  return magnetic ? <Magnetic className={block ? 'w-full' : undefined}>{el}</Magnetic> : el
})

type LinkButtonProps = Common & { href: string; external?: boolean } & Omit<ComponentPropsWithoutRef<'a'>, 'children' | 'href'>

export function ButtonLink({ variant = 'primary', size = 'md', arrow, icon, magnetic, block, className, children, href, external, ...rest }: LinkButtonProps) {
  const cls = cn('btn group', VARIANT[variant], SIZE[size], block && 'w-full', className)
  const inner = (
    <Inner arrow={arrow} icon={icon}>
      {children}
    </Inner>
  )
  const el = external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" data-cursor="hover" onPointerEnter={setFillOrigin} onPointerLeave={setFillOrigin} className={cls} {...rest}>
      {inner}
    </a>
  ) : (
    <Link href={href} data-cursor="hover" onPointerEnter={setFillOrigin} onPointerLeave={setFillOrigin} className={cls} {...rest}>
      {inner}
    </Link>
  )
  return magnetic ? <Magnetic className={block ? 'w-full' : undefined}>{el}</Magnetic> : el
}

/** Circular icon button (bag, search, close …). */
export const IconButton = forwardRef<HTMLButtonElement, ComponentPropsWithoutRef<'button'> & { label: string; tone?: 'dark' | 'light' }>(
  function IconButton({ label, className, children, tone = 'dark', type = 'button', ...rest }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        title={label}
        data-cursor="hover"
        className={cn(
          'relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300',
          tone === 'dark' ? 'hover:bg-ink/[0.06]' : 'hover:bg-ivory/10',
          className
        )}
        {...rest}
      >
        {children}
      </button>
    )
  }
)

/** Text link with the draw-in underline. */
export function TextLink({ href, className, children, ...rest }: ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link href={href} data-cursor="hover" className={cn('link-wipe', className)} {...rest}>
      {children}
    </Link>
  )
}
