'use client'

import Image from 'next/image'
import { cn } from '@/lib/format'
import type { Marketplace } from '@/types/commerce'

/** From this many logos the row drifts on a loop; fewer sit still in the middle. */
const LOOP_FROM = 5

/**
 * "Also shop us on": the marketplaces the shop sells on (Admin → Settings → Store → Marketplaces),
 * each its own colourful logo linking to the shop's store there, on a white band above the footer
 * so the logos keep their real colours. With enough of them the row drifts slowly on a loop and
 * pauses under the pointer; with reduced motion it simply wraps. Hidden while there are none.
 */
export default function MarketplaceStrip({ items }: { items: Marketplace[] }) {
  const list = items.filter((m) => m.name && m.url)
  if (!list.length) return null
  const loop = list.length >= LOOP_FROM

  const row = (copy: boolean) =>
    list.map((m) => (
      // The second copy makes the loop seamless; screen readers and the keyboard skip it, and it goes with the motion.
      <li key={`${copy ? 'b' : 'a'}-${m.url}`} className={cn('shrink-0', copy && 'motion-reduce:hidden')} aria-hidden={copy || undefined}>
        <a href={m.url} target="_blank" rel="noopener noreferrer" tabIndex={copy ? -1 : undefined} aria-label={`${m.name} (opens in a new tab)`} className="group flex h-16 items-center px-6 md:px-9">
          {m.logo ? (
            <Image
              src={m.logo}
              alt=""
              width={180}
              height={56}
              unoptimized={m.logo.startsWith('/api/media/')}
              className="h-8 w-auto max-w-[9.5rem] object-contain transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.08] md:h-10"
            />
          ) : (
            <span className="text-[1.25rem] font-semibold tracking-[-0.01em] text-ink transition-transform duration-500 group-hover:scale-[1.08]">{m.name}</span>
          )}
        </a>
      </li>
    ))

  return (
    <section aria-labelledby="marketplaces-title" className="border-t border-ink/10 bg-white py-8 text-ink md:py-10">
      <h2 id="marketplaces-title" className="text-center text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-stone">
        Also shop us on
      </h2>
      {loop ? (
        <div className="sk-marquee-wrap relative mt-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
          <ul className="sk-marquee flex w-max motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center" style={{ ['--marquee-duration' as string]: `${list.length * 6}s` }}>
            {row(false)}
            {row(true)}
          </ul>
        </div>
      ) : (
        <ul className="container-wide mt-4 flex flex-wrap items-center justify-center">{row(false)}</ul>
      )}
    </section>
  )
}
