import Link from 'next/link'
import { cn } from '@/lib/format'

/** The home page's call to action: a square dark button in spaced capitals, with an arrow. */
export default function SquareLink({ href, children, tone = 'dark', className }: { href: string; children: React.ReactNode; tone?: 'dark' | 'light'; className?: string }) {
  return (
    <Link
      href={href || '/shop'}
      className={cn(
        'group inline-flex h-12 items-center gap-3 px-7 text-[0.74rem] font-medium uppercase tracking-[0.16em] transition-colors duration-300',
        tone === 'dark' ? 'bg-ink text-bone hover:bg-burgundy' : 'bg-bone text-ink hover:bg-ivory',
        className
      )}
    >
      {children}
      <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1">
        <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </Link>
  )
}
