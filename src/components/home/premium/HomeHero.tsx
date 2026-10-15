import Image from 'next/image'
import { accent } from '@/lib/accent'
import type { HomepageSettings } from '@/types/commerce'
import SquareLink from './SquareLink'

/**
 * A wide photograph with the copy on its left: eyebrow in spaced capitals, a serif headline, a short
 * line and one call to action. A soft wash keeps the copy legible over any photograph the admin sets.
 */
export default function HomeHero({ home, storeName }: { home: HomepageSettings; storeName: string }) {
  return (
    <section aria-label={`${storeName} — ${home.heroTitle}`} data-nav-theme="light" className="relative isolate overflow-hidden bg-parchment text-ink">
      <div className="relative h-[min(78svh,640px)] md:h-[clamp(440px,42vw,640px)]">
        {home.heroImage ? (
          <Image
            src={home.heroImage}
            alt={home.heroImageAlt}
            fill
            priority
            sizes="100vw"
            className="sk-settle -z-10 object-cover object-[72%_22%]"
            unoptimized={home.heroImage.startsWith('/api/media/')}
          />
        ) : null}
        {/* Legibility wash: from the left on wide screens, from the bottom on phones. */}
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-bone via-bone/70 to-transparent md:bg-gradient-to-r md:from-bone/90 md:via-bone/35 md:to-transparent" />

        <div className="container-wide flex h-full flex-col justify-end pb-12 md:justify-center md:pb-0">
          <div className="max-w-xl">
            {home.heroEyebrow ? (
              <p className="sk-rise text-[0.72rem] font-medium uppercase tracking-[0.3em] text-ink/75 md:text-[0.8rem]">{home.heroEyebrow}</p>
            ) : null}
            <h1 className="sk-rise mt-4 font-serif text-[clamp(2.6rem,5.4vw,4.75rem)] font-normal leading-[1.02] tracking-[-0.01em] [animation-delay:120ms]">
              {accent(home.heroTitle)}
            </h1>
            {home.heroSubtitle ? (
              <p className="sk-rise mt-5 text-[1.05rem] tracking-[0.08em] text-ink/80 [animation-delay:240ms] md:text-lg">{home.heroSubtitle}</p>
            ) : null}
            {home.primaryCtaLabel ? (
              <div className="sk-rise mt-8 [animation-delay:360ms]">
                <SquareLink href={home.primaryCtaHref}>{home.primaryCtaLabel}</SquareLink>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
