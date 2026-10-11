'use client'

import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { api, ApiError } from '@/lib/api'
import { cn } from '@/lib/format'

/* ─────────────────────────── Layout ─────────────────────────── */

export function PageHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back}
        <h1 className="font-display text-[2.6rem] leading-none tracking-[-0.02em]">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-stone">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function Card({ title, actions, children, className, pad = true }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={cn('min-w-0 rounded-2xl border border-ink/10 bg-white/70 shadow-[0_1px_0_rgba(22,16,14,0.03)]', className)}>
      {title || actions ? (
        <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-5 py-4">
          {title ? <h2 className="text-sm font-medium">{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      <div className={pad ? 'p-5' : undefined}>{children}</div>
    </section>
  )
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'info' }) {
  const t = {
    neutral: 'bg-ink/[0.06] text-ink/80',
    good: 'bg-success/15 text-success',
    warn: 'bg-gold/25 text-gold-deep',
    bad: 'bg-error/10 text-error',
    info: 'bg-burgundy/10 text-burgundy',
  }[tone]
  return <span className={cn('inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', t)}>{children}</span>
}

export const STATUS_TONE: Record<string, 'neutral' | 'good' | 'warn' | 'bad' | 'info'> = {
  active: 'good',
  draft: 'warn',
  archived: 'neutral',
  placed: 'warn',
  confirmed: 'info',
  shipped: 'info',
  delivered: 'good',
  cancelled: 'bad',
  pending: 'warn',
  approved: 'good',
  rejected: 'bad',
  received: 'info',
  refunded: 'good',
  paid: 'good',
  new: 'warn',
  read: 'neutral',
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/15 px-6 py-14 text-center">
      <p className="font-display text-2xl">{title}</p>
      {children ? <div className="mt-2 text-sm text-stone">{children}</div> : null}
    </div>
  )
}

/* ─────────────────────────── Inputs ─────────────────────────── */

const inputCls = 'w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none transition-[border-color,box-shadow] focus:border-ink/50 focus:shadow-[0_0_0_3px_rgba(22,16,14,0.06)] disabled:bg-ink/[0.03] disabled:text-stone'

function Wrap({ label, hint, error, children, id, className }: { label?: ReactNode; hint?: ReactNode; error?: string; children: ReactNode; id: string; className?: string }) {
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink/70">
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-xs text-error">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-stone">{hint}</p>
      ) : null}
    </div>
  )
}

type InputProps = ComponentPropsWithoutRef<'input'> & { label?: ReactNode; hint?: ReactNode; error?: string; wrapClassName?: string; prefix?: string }

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, hint, error, wrapClassName, className, id, prefix, ...rest }, ref) {
  const auto = useId()
  const iid = id ?? auto
  return (
    <Wrap label={label} hint={hint} error={error} id={iid} className={wrapClassName}>
      <div className="relative">
        {prefix ? <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-stone">{prefix}</span> : null}
        <input ref={ref} id={iid} aria-invalid={!!error || undefined} className={cn(inputCls, prefix && 'pl-8', error && 'border-error/60', className)} {...rest} />
      </div>
    </Wrap>
  )
})

type TextareaProps = ComponentPropsWithoutRef<'textarea'> & { label?: ReactNode; hint?: ReactNode; error?: string; wrapClassName?: string }

export function Textarea({ label, hint, error, wrapClassName, className, id, rows = 4, ...rest }: TextareaProps) {
  const auto = useId()
  const iid = id ?? auto
  return (
    <Wrap label={label} hint={hint} error={error} id={iid} className={wrapClassName}>
      <textarea id={iid} rows={rows} aria-invalid={!!error || undefined} className={cn(inputCls, 'resize-y leading-relaxed', error && 'border-error/60', className)} {...rest} />
    </Wrap>
  )
}

type SelectProps = ComponentPropsWithoutRef<'select'> & { label?: ReactNode; hint?: ReactNode; error?: string; wrapClassName?: string }

export function Select({ label, hint, error, wrapClassName, className, id, children, ...rest }: SelectProps) {
  const auto = useId()
  const iid = id ?? auto
  return (
    <Wrap label={label} hint={hint} error={error} id={iid} className={wrapClassName}>
      <select id={iid} className={cn(inputCls, 'appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 12 12%27%3E%3Cpath d=%27M2 4.5 6 8l4-3.5%27 stroke=%27%2316100e%27 stroke-width=%271.5%27 fill=%27none%27/%3E%3C/svg%3E")] bg-[length:12px] bg-[right_0.9rem_center] bg-no-repeat pr-9', className)} {...rest}>
        {children}
      </select>
    </Wrap>
  )
}

export function Toggle({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; description?: ReactNode; disabled?: boolean }) {
  return (
    <label className={cn('flex cursor-pointer items-start justify-between gap-4', disabled && 'cursor-not-allowed opacity-60')}>
      <span>
        <span className="block text-sm">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-stone">{description}</span> : null}
      </span>
      <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0">
        <input type="checkbox" role="switch" className="peer sr-only" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
        <span className="absolute inset-0 rounded-full bg-ink/15 transition-colors peer-checked:bg-success peer-focus-visible:ring-2 peer-focus-visible:ring-gold" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  )
}

export function Btn({ variant = 'primary', size = 'md', className, children, loading, ...rest }: ComponentPropsWithoutRef<'button'> & { variant?: 'primary' | 'outline' | 'ghost' | 'danger'; size?: 'sm' | 'md'; loading?: boolean }) {
  const v = {
    primary: 'bg-ink text-ivory hover:bg-burgundy',
    outline: 'border border-ink/15 bg-white hover:border-ink/40',
    ghost: 'hover:bg-ink/[0.06]',
    danger: 'border border-error/30 text-error hover:bg-error hover:text-white',
  }[variant]
  return (
    <button
      type="button"
      className={cn('inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50', size === 'sm' ? 'h-8 px-3.5 text-xs' : 'h-10 px-5 text-sm', v, className)}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden /> : null}
      {children}
    </button>
  )
}

/* ─────────────────────────── Mutations ─────────────────────────── */

/** Calls the admin API, toasts the outcome and refreshes server data. Returns the JSON or null. */
export function useMutate() {
  const router = useRouter()
  const addToast = useUIStore((s) => s.addToast)
  const [busy, setBusy] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const run = useCallback(
    async <T,>(method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, body?: unknown, success?: string): Promise<T | null> => {
      setBusy(true)
      setFieldErrors({})
      try {
        const res = await api<T>(url, { method, body })
        if (success) addToast(success)
        router.refresh()
        return res
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Something went wrong.'
        if (err instanceof ApiError && err.fields) setFieldErrors(err.fields)
        addToast(msg, 'error')
        return null
      } finally {
        setBusy(false)
      }
    },
    [router, addToast]
  )
  return { run, busy, fieldErrors, setFieldErrors }
}

export function confirmAction(message: string) {
  return typeof window !== 'undefined' && window.confirm(message)
}
