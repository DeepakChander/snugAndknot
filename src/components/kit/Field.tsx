'use client'

import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { cn } from '@/lib/format'

type Tone = 'light' | 'dark'

const box = (tone: Tone, error?: string) =>
  cn(
    'peer block w-full border bg-transparent px-4 pb-2.5 pt-6 text-[0.95rem] outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-transparent',
    tone === 'light'
      ? 'border-ink/15 text-ink focus:border-ink/60 focus:shadow-[0_0_0_4px_rgba(22,16,14,0.06)]'
      : 'border-ivory/20 text-ivory focus:border-ivory/70 focus:shadow-[0_0_0_4px_rgba(248,243,234,0.08)]',
    error && (tone === 'light' ? 'border-error/70' : 'border-red-300/70')
  )

const floating = (tone: Tone) =>
  cn(
    'pointer-events-none absolute left-4 top-4 origin-left text-[0.95rem] transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)]',
    'peer-focus:top-2.5 peer-focus:text-[0.7rem] peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:text-[0.7rem]',
    tone === 'light' ? 'text-stone' : 'text-taupe'
  )

type FieldProps = ComponentPropsWithoutRef<'input'> & { label: string; error?: string; hint?: string; tone?: Tone; trailing?: ReactNode }

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, hint, tone = 'light', trailing, className, id, ...rest },
  ref
) {
  const auto = useId()
  const inputId = id ?? auto
  const describedBy = error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined
  return (
    <div className={cn('relative', className)}>
      <input
        ref={ref}
        id={inputId}
        placeholder={label}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy}
        className={cn(box(tone, error), trailing ? 'pr-12' : undefined)}
        {...rest}
      />
      <label htmlFor={inputId} className={floating(tone)}>
        {label}
        {rest.required ? <span aria-hidden> *</span> : null}
      </label>
      {trailing ? <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div> : null}
      {error ? (
        <p id={`${inputId}-err`} role="alert" className={cn('mt-1.5 pl-1 text-xs', tone === 'light' ? 'text-error' : 'text-red-300')}>
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className={cn('mt-1.5 pl-1 text-xs', tone === 'light' ? 'text-stone' : 'text-taupe')}>
          {hint}
        </p>
      ) : null}
    </div>
  )
})

type AreaProps = ComponentPropsWithoutRef<'textarea'> & { label: string; error?: string; tone?: Tone }

export const TextArea = forwardRef<HTMLTextAreaElement, AreaProps>(function TextArea({ label, error, tone = 'light', className, id, rows = 5, ...rest }, ref) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <div className={cn('relative', className)}>
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        placeholder={label}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? `${inputId}-err` : undefined}
        className={cn(box(tone, error), 'resize-y')}
        {...rest}
      />
      <label htmlFor={inputId} className={floating(tone)}>
        {label}
        {rest.required ? <span aria-hidden> *</span> : null}
      </label>
      {error ? (
        <p id={`${inputId}-err`} role="alert" className={cn('mt-1.5 pl-1 text-xs', tone === 'light' ? 'text-error' : 'text-red-300')}>
          {error}
        </p>
      ) : null}
    </div>
  )
})

type SelectProps = ComponentPropsWithoutRef<'select'> & { label: string; error?: string; tone?: Tone }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ label, error, tone = 'light', className, id, children, ...rest }, ref) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <div className={cn('relative', className)}>
      <select
        ref={ref}
        id={inputId}
        aria-invalid={!!error || undefined}
        className={cn(box(tone, error), 'appearance-none pr-10 [&>option]:text-ink')}
        {...rest}
      >
        {children}
      </select>
      <label htmlFor={inputId} className={cn('pointer-events-none absolute left-4 top-2.5 text-[0.7rem]', tone === 'light' ? 'text-stone' : 'text-taupe')}>
        {label}
      </label>
      <svg className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 opacity-60" viewBox="0 0 12 12" aria-hidden>
        <path d="M2 4.5 6 8l4-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
      {error ? (
        <p role="alert" className={cn('mt-1.5 pl-1 text-xs', tone === 'light' ? 'text-error' : 'text-red-300')}>
          {error}
        </p>
      ) : null}
    </div>
  )
})

export function Checkbox({ label, className, ...rest }: ComponentPropsWithoutRef<'input'> & { label: ReactNode }) {
  return (
    <label className={cn('group inline-flex cursor-pointer select-none items-start gap-3 text-sm', className)}>
      <span className="relative mt-0.5 inline-flex h-[18px] w-[18px] shrink-0">
        <input type="checkbox" className="peer absolute inset-0 appearance-none border border-current/30 transition-colors checked:border-ink checked:bg-ink" {...rest} />
        <svg viewBox="0 0 12 12" className="pointer-events-none relative m-auto h-2.5 w-2.5 text-ivory opacity-0 transition-opacity peer-checked:opacity-100" aria-hidden>
          <path d="M2 6.5 5 9l5-6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span>{label}</span>
    </label>
  )
}
