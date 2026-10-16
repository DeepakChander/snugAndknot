import Image from 'next/image'
import Link from 'next/link'
import { accent, plain } from '@/lib/accent'
import { cn } from '@/lib/format'
import { ButtonLink } from '@/components/kit/Button'
import type { HomepageSettings } from '@/types/commerce'

export interface HeroPanelView {
  label: string
  href: string
  image: string
}

/**
 * Home hero: the departments side by side in full-height photographs of the real pieces (Women,
 * Men, and Kids once it has a photograph), each a way into its department, with one line of copy
 * and the buttons in a band underneath so nothing covers the clothes. The panels and the words are
 * set in Admin → Settings → Home page. The photographs show at once; the only motion is the copy rising in and a slight zoom on hover.
 */
export default function HomeHero({ home, storeName, panels }: { home: HomepageSettings; storeName: string; panels: HeroPanelView[] }) {
  const n = panels.length
  return (
    <section aria-label={`${storeName}: ${plain(home.heroTitle)}`} className="bg-white pt-[calc(var(--nav-h)+var(--announce-h,0px))] text-ink">
      {n ? (
        <div
          className={cn(
            'no-scrollbar flex gap-[3px] overflow-x-auto md:grid md:overflow-visible',
            // Two panels share a phone screen; a third makes them scroll sideways.
            n > 2 && 'snap-x snap-mandatory'
          )}
          style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
        >
          {panels.map((p, i) => (
            <Link
              key={p.href + p.label}
              href={p.href}
              className={cn(
                'group relative block h-[min(128vw,72svh)] shrink-0 snap-start overflow-hidden bg-parchment md:h-[calc(100svh-var(--nav-h)-var(--announce-h,0px)-7rem)] md:min-h-[520px] md:w-auto',
                n === 1 ? 'w-full' : n === 2 ? 'w-[calc(50%-1.5px)]' : 'w-[76vw]'
              )}
            >
              <Image
                src={p.image}
                // The panel's name says where it leads; the photograph is the same idea, so it stays silent.
                alt=""
                fill
                priority={i < 2}
                sizes={`(min-width: 768px) ${Math.round(100 / n)}vw, ${n > 2 ? 76 : n === 2 ? 50 : 100}vw`}
                className="object-cover object-[50%_22%] transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]"
              />
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              <span className="sk-rise absolute inset-x-0 bottom-0 p-4 text-white [animation-delay:200ms] sm:p-6 md:p-8">
                <span className="block text-[clamp(1.35rem,3.2vw,3rem)] font-semibold uppercase leading-none tracking-[0.12em]">{p.label}</span>
                <span className="mt-3 inline-block border-b border-white/80 pb-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] transition-colors group-hover:border-white md:mt-4 md:text-[0.75rem]">Shop now</span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}

      <div className="container-wide flex flex-col gap-5 py-7 md:min-h-[7rem] md:flex-row md:items-center md:justify-between md:gap-10 md:py-5">
        <div className="sk-rise">
          {home.heroEyebrow ? <p className="text-[0.7rem] font-medium uppercase tracking-[0.26em] text-stone">{home.heroEyebrow}</p> : null}
          <h1 className="mt-1.5 font-serif text-[clamp(1.9rem,3.4vw,2.9rem)] font-normal leading-[1.05]">{accent(home.heroTitle)}</h1>
        </div>
        <div className="sk-rise flex flex-col gap-4 [animation-delay:120ms] md:flex-row md:items-center md:gap-8">
          {home.heroSubtitle ? <p className="text-[0.82rem] uppercase tracking-[0.18em] text-stone">{home.heroSubtitle}</p> : null}
          <div className="flex flex-wrap gap-3">
            {home.primaryCtaLabel ? (
              <ButtonLink href={home.primaryCtaHref || '/shop'} arrow>
                {home.primaryCtaLabel}
              </ButtonLink>
            ) : null}
            {home.secondaryCtaLabel ? (
              <ButtonLink href={home.secondaryCtaHref || '/collections'} variant="outline">
                {home.secondaryCtaLabel}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
