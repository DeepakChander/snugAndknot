import { accent } from '@/lib/accent'
import { formatMoney } from '@/lib/format'
import { ButtonLink } from '@/components/kit/Button'
import type { CommerceSettings, HomepageSettings } from '@/types/commerce'
import GarmentCarousel, { type CarouselItem } from './GarmentCarousel'

/**
 * Home hero. Says in one look what the shop is (everyday clothing for men, women and kids), with
 * the real pieces turning on a 3D carousel beside it: the only 3D on the page. The copy comes from
 * Admin → Settings → Home page; the small facts under the buttons come from the store's settings,
 * so they never promise more than checkout does.
 */
export default function HomeHero({
  home,
  commerce,
  storeName,
  items,
}: {
  home: HomepageSettings
  commerce: CommerceSettings
  storeName: string
  items: CarouselItem[]
}) {
  const m = (n: number) => formatMoney(n, commerce.currency, commerce.locale)
  const facts = [
    commerce.freeShippingThreshold > 0 ? `Free shipping over ${m(commerce.freeShippingThreshold)}` : null,
    commerce.returnWindowDays > 0 ? `${commerce.returnWindowDays}-day returns` : null,
    'Hand-finished in small batches',
  ].filter((f): f is string => !!f)

  return (
    <section
      aria-label={`${storeName} — ${home.heroTitle}`}
      data-nav-theme="light"
      className="relative overflow-hidden bg-ivory pb-14 pt-[calc(var(--nav-h)+var(--announce-h,0px)+1.5rem)] text-ink md:pb-16 lg:min-h-[100svh]"
    >
      {/* A soft pool of light behind the carousel. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(48%_55%_at_72%_55%,rgba(255,255,255,0.75),transparent_70%)]" />

      <div className="container-wide relative grid items-center gap-10 lg:min-h-[calc(100svh-var(--nav-h)-var(--announce-h,0px)-5.5rem)] lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          {home.heroEyebrow ? <p className="sk-rise text-[0.72rem] font-medium uppercase tracking-[0.3em] text-ink/70 md:text-[0.78rem]">{home.heroEyebrow}</p> : null}
          <h1 className="sk-rise mt-4 font-serif text-[clamp(2.8rem,5.6vw,5.25rem)] font-normal leading-[1.0] tracking-[-0.01em] [animation-delay:120ms]">{accent(home.heroTitle)}</h1>
          {home.heroSubtitle ? <p className="sk-rise mt-5 text-[1.05rem] tracking-[0.06em] text-ink/75 [animation-delay:220ms] md:text-lg">{home.heroSubtitle}</p> : null}
          <div className="sk-rise mt-8 flex flex-wrap gap-3 [animation-delay:320ms]">
            {home.primaryCtaLabel ? (
              <ButtonLink href={home.primaryCtaHref || '/shop'} size="lg" arrow>
                {home.primaryCtaLabel}
              </ButtonLink>
            ) : null}
            {home.secondaryCtaLabel ? (
              <ButtonLink href={home.secondaryCtaHref || '/collections'} variant="outline" size="lg">
                {home.secondaryCtaLabel}
              </ButtonLink>
            ) : null}
          </div>
          <ul className="sk-rise mt-9 flex flex-wrap gap-x-5 gap-y-2 text-[0.8rem] text-stone [animation-delay:420ms]">
            {facts.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span aria-hidden className="h-1 w-1 rounded-full bg-burgundy" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {items.length >= 3 ? (
          <div className="sk-rise [animation-delay:200ms] lg:col-span-7">
            <GarmentCarousel items={items} />
          </div>
        ) : null}
      </div>
    </section>
  )
}
