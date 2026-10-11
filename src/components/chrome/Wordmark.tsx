import { cn } from '@/lib/format'

/**
 * Snug&Knot wordmark.
 * - `mark`: grotesk capitals with the ampersand set in the italic serif, in signal red.
 * - `chip`: compact capitals for the navigation chip, the ampersand drawn as a star stitch.
 */
export default function Wordmark({ className, name = 'Snug&Knot', variant = 'mark' }: { className?: string; name?: string; variant?: 'mark' | 'chip' }) {
  const hasAmp = name.includes('&')
  const [a, b] = hasAmp ? name.split('&') : [name, '']

  if (variant === 'chip') {
    return (
      <span className={cn('group/wm inline-flex items-center gap-[0.5em] font-display font-[650] uppercase leading-none tracking-[0.02em]', className)}>
        <span>{a}</span>
        {hasAmp ? (
          <>
            <span aria-hidden className="inline-block text-[0.8em] text-signal transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover/wm:rotate-90">
              ✦
            </span>
            <span className="sr-only">&amp;</span>
          </>
        ) : null}
        <span>{b}</span>
      </span>
    )
  }

  return (
    <span className={cn('group/wm inline-flex items-baseline font-display font-[650] uppercase leading-[0.8] tracking-[-0.055em]', className)}>
      <span>{a}</span>
      {hasAmp ? (
        <span className="mx-[0.03em] inline-block font-accent font-normal normal-case italic tracking-normal text-signal transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover/wm:rotate-[-12deg] group-hover/wm:scale-110">
          &amp;
        </span>
      ) : null}
      <span>{b}</span>
    </span>
  )
}
