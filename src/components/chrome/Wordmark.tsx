import { cn } from '@/lib/format'

/** Snug&Knot wordmark — display serif with the gold italic ampersand that turns on hover. */
export default function Wordmark({ className, name = 'Snug&Knot' }: { className?: string; name?: string }) {
  const [a, b] = name.includes('&') ? name.split('&') : [name, '']
  return (
    <span className={cn('group/wm inline-flex items-baseline font-display leading-none tracking-[-0.02em]', className)}>
      <span>{a}</span>
      {b !== '' || name.includes('&') ? (
        <span className="mx-[0.04em] inline-block italic text-gold transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover/wm:rotate-[-14deg] group-hover/wm:scale-110">
          &amp;
        </span>
      ) : null}
      <span>{b}</span>
    </span>
  )
}
