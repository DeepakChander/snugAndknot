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
 * Home hero, in one of two layouts (Admin → Settings → Home page → Hero):
 *
 * - With a wide campaign photograph: it fills the first screen, with the line, the serif title and
 *   the buttons over its lower left, and the department photographs as a row of tiles under it.
 * - Without one: the departments side by side in full-height photographs, each named large in the
 *   serif, and the line, title and buttons in a band underneath so nothing covers the clothes.
 *
 * Still photographs; the only motion is the copy rising in and a slight zoom on hover.
 */
export default function HomeHero({ home, storeName, panels }: { home: HomepageSettings; storeName: string; panels: HeroPanelView[] }) {
  const label = `${storeName}: ${plain(home.heroTitle)}`
  if (home.heroImage) return <CampaignHero home={home} label={label} panels={panels} />

  return (
    <section aria-label={label} className="bg-ivory pt-[calc(var(--nav-h)+var(--announce-h,0px))] text-ink">
      <Panels panels={panels} className="h-[min(128vw,74svh)] md:h-[calc(100svh-var(--nav-h)-var(--announce-h,0px)-8.5rem)] md:min-h-[540px]" priority />

      <div className="container-wide flex flex-col gap-6 py-8 md:min-h-[8.5rem] md:flex-row md:items-center md:justify-between md:gap-12 md:py-6">
        <div className="sk-rise">
          {home.heroEyebrow ? <p className="text-eyebrow text-stone">{home.heroEyebrow}</p> : null}
          <h1 className="mt-2 font-serif text-[clamp(2.2rem,4vw,3.6rem)] leading-none">{accent(home.heroTitle)}</h1>
        </div>
        <div className="sk-rise flex flex-col gap-4 [animation-delay:120ms] md:items-end">
          {home.heroSubtitle ? <p className="text-[0.78rem] uppercase tracking-[0.2em] text-stone">{home.heroSubtitle}</p> : null}
          <Buttons home={home} />
        </div>
      </div>
    </section>
  )
}

/** The department photographs side by side, each named large; a swipeable row on phones when there are three. */
function Panels({ panels, className, priority }: { panels: HeroPanelView[]; className: string; priority?: boolean }) {
  const n = panels.length
  if (!n) return null
  return (
    <div className={cn('no-scrollbar flex gap-[3px] overflow-x-auto md:grid md:overflow-visible', n > 2 && 'snap-x snap-mandatory')} style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {panels.map((p, i) => (
        <Link
          key={p.href + p.label}
          href={p.href}
          className={cn('group relative block shrink-0 snap-start overflow-hidden bg-parchment md:w-auto', className, n === 1 ? 'w-full' : n === 2 ? 'w-[calc(50%-1.5px)]' : 'w-[76vw]')}
        >
          <Image
            src={p.image}
            alt=""
            fill
            priority={priority && i < 2}
            sizes={`(min-width: 768px) ${Math.round(100 / n)}vw, ${n > 2 ? 76 : n === 2 ? 50 : 100}vw`}
            className="object-cover object-[50%_22%] transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.03]"
            unoptimized={p.image.startsWith('/api/media/')}
          />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <span className="sk-rise absolute inset-x-0 bottom-0 p-4 text-white [animation-delay:200ms] sm:p-6 md:p-9">
            <span className="block font-serif text-[clamp(2rem,4.6vw,4.4rem)] leading-none">{p.label}</span>
            <span className="mt-3 inline-flex items-center gap-2 border-b border-white/80 pb-1 text-[0.66rem] font-medium uppercase tracking-[0.18em] transition-colors group-hover:border-white md:mt-4 md:text-[0.74rem]">
              Shop {p.label.toLowerCase()} <span aria-hidden>→</span>
            </span>
          </span>
        </Link>
      ))}
    </div>
  )
}

function Buttons({ home, light }: { home: HomepageSettings; light?: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      {home.primaryCtaLabel ? (
        <ButtonLink href={home.primaryCtaHref || '/shop'} variant={light ? 'light' : 'primary'} arrow>
          {home.primaryCtaLabel}
        </ButtonLink>
      ) : null}
      {home.secondaryCtaLabel ? (
        <ButtonLink href={home.secondaryCtaHref || '/collections'} variant={light ? 'outline-light' : 'outline'}>
          {home.secondaryCtaLabel}
        </ButtonLink>
      ) : null}
    </div>
  )
}

/**
 * The first screen as one campaign photograph with the copy over its lower left, and the departments
 * that have a photograph as a row of tiles right under it. A department without a photograph is a
 * text link over the campaign instead.
 */
function CampaignHero({ home, label, panels }: { home: HomepageSettings; label: string; panels: HeroPanelView[] }) {
  const tiles = panels.filter((p) => p.image)
  const links = panels.filter((p) => !p.image)
  return (
    <section aria-label={label} className="bg-ivory pt-[calc(var(--nav-h)+var(--announce-h,0px))]">
      <div className="relative h-[min(150vw,80svh)] overflow-hidden bg-parchment text-white md:h-[calc(100svh-var(--nav-h)-var(--announce-h,0px))] md:min-h-[560px]">
        {/* People sit in the right half of a campaign photograph (see the hint in the admin), so a phone keeps them in view. */}
        <Image src={home.heroImage} alt="" fill priority sizes="100vw" className="object-cover object-[74%_30%] md:object-[50%_30%]" unoptimized={home.heroImage.startsWith('/api/media/')} />
        <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent md:bg-gradient-to-tr md:from-black/45 md:via-transparent" />
        <div className="container-wide absolute inset-x-0 bottom-0 pb-8 md:pb-14">
          <div className="sk-rise max-w-2xl">
            {home.heroEyebrow ? <p className="text-eyebrow text-white/85">{home.heroEyebrow}</p> : null}
            <h1 className="mt-3 font-serif text-[clamp(2.8rem,6.4vw,6rem)] leading-[0.95]">{accent(home.heroTitle)}</h1>
            {home.heroSubtitle ? <p className="mt-4 text-[0.8rem] uppercase tracking-[0.2em] text-white/85">{home.heroSubtitle}</p> : null}
          </div>
          <div className="sk-rise mt-7 flex flex-wrap items-center gap-x-8 gap-y-4 [animation-delay:150ms]">
            <Buttons home={home} light />
            {links.length ? (
              <nav aria-label="Departments" className="flex gap-6">
                {links.map((p) => (
                  <Link key={p.href} href={p.href} className="border-b border-white/70 pb-1 text-[0.74rem] font-medium uppercase tracking-[0.16em] hover:border-white">
                    {p.label}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </div>
      </div>
      {tiles.length ? (
        <div className="pt-[3px]">
          <Panels panels={tiles} className="aspect-[4/5] md:aspect-auto md:h-[min(46vw,88svh)]" />
        </div>
      ) : null}
    </section>
  )
}
