import { cn } from '@/lib/format'

/** A strip of garment-care symbols — the knitwear version of a label rail. Decorative. */
export default function CareSymbols({ className }: { className?: string }) {
  const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)} aria-hidden>
      {/* Hand wash */}
      <svg viewBox="0 0 24 24" className="h-[1.15em] w-[1.15em]" aria-hidden>
        <path d="M3 8l1.8 10.5a1.5 1.5 0 0 0 1.5 1.2h11.4a1.5 1.5 0 0 0 1.5-1.2L21 8" {...s} />
        <path d="M3 8c1.5 1.4 3 1.4 4.5 0s3-1.4 4.5 0 3 1.4 4.5 0 3-1.4 4.5 0" {...s} />
        <path d="M10 12.5v3.5M12 12v4M14 12.5v3.5" {...s} />
      </svg>
      {/* Do not bleach */}
      <svg viewBox="0 0 24 24" className="h-[1.15em] w-[1.15em]" aria-hidden>
        <path d="M12 4 21 19H3z" {...s} />
        <path d="M5 6l14 14M19 6 5 20" {...s} />
      </svg>
      {/* Dry flat */}
      <svg viewBox="0 0 24 24" className="h-[1.15em] w-[1.15em]" aria-hidden>
        <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" {...s} />
        <path d="M7 12h10" {...s} />
      </svg>
      {/* Cool iron */}
      <svg viewBox="0 0 24 24" className="h-[1.15em] w-[1.15em]" aria-hidden>
        <path d="M3 18h18l-1.5-6.5A3 3 0 0 0 16.6 9H9" {...s} />
        <path d="M6.5 9H9" {...s} />
        <circle cx="12.5" cy="14.5" r="0.9" fill="currentColor" />
      </svg>
      {/* Do not tumble dry */}
      <svg viewBox="0 0 24 24" className="h-[1.15em] w-[1.15em]" aria-hidden>
        <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" {...s} />
        <circle cx="12" cy="12" r="5" {...s} />
        <path d="M5 5l14 14M19 5 5 19" {...s} />
      </svg>
    </span>
  )
}
