'use client'

import { useId, useState } from 'react'
import { cn } from '@/lib/format'

const STAR = 'M12 2.6l2.76 6.03 6.6.73-4.93 4.48 1.36 6.5L12 17.07l-5.79 3.27 1.36-6.5L2.64 9.36l6.6-.73L12 2.6z'

/** Read-only star rating with fractional fill. */
export function Stars({ value, size = 14, className, label = true }: { value: number; size?: number; className?: string; label?: boolean }) {
  const id = useId().replace(/:/g, '')
  const pct = Math.max(0, Math.min(5, value)) / 5
  return (
    <span className={cn('inline-flex items-center', className)} role={label ? 'img' : undefined} aria-label={label ? `${value.toFixed(1)} out of 5 stars` : undefined}>
      <svg width={size * 5 + 8} height={size} viewBox={`0 0 ${5 * 24 + 8} 24`} aria-hidden>
        <defs>
          <clipPath id={`clip-${id}`}>
            <rect x="0" y="0" width={(5 * 24 + 8) * pct} height="24" />
          </clipPath>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={`b${i}`} d={STAR} transform={`translate(${i * 26} 0)`} fill="currentColor" opacity="0.18" />
        ))}
        <g clipPath={`url(#clip-${id})`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={`f${i}`} d={STAR} transform={`translate(${i * 26} 0)`} fill="var(--color-gold)" />
          ))}
        </g>
      </svg>
    </span>
  )
}

/** Accessible 1–5 rating input (radio group) with hover preview. */
export function StarInput({ value, onChange, name = 'rating', error }: { value: number; onChange: (v: number) => void; name?: string; error?: string }) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  const words = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Exceptional']
  return (
    <fieldset>
      <legend className="sr-only">Your rating</legend>
      <div className="flex items-center gap-1" onPointerLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer p-1" onPointerEnter={() => setHover(n)} data-cursor="hover">
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} className="peer sr-only" />
            <svg viewBox="0 0 24 24" className={cn('h-7 w-7 transition-transform duration-300 peer-focus-visible:scale-110', n <= shown ? 'scale-105' : '')} aria-hidden>
              <path d={STAR} fill={n <= shown ? 'var(--color-gold)' : 'currentColor'} opacity={n <= shown ? 1 : 0.2} />
            </svg>
            <span className="sr-only">{n} star{n > 1 ? 's' : ''}</span>
          </label>
        ))}
        <span className="ml-3 text-label text-stone" aria-live="polite">
          {words[shown]}
        </span>
      </div>
      {error ? (
        <p role="alert" className="mt-1 text-xs text-error">
          {error}
        </p>
      ) : null}
    </fieldset>
  )
}
