import Image from 'next/image'
import type { HomepageSettings } from '@/types/commerce'
import SquareLink from './SquareLink'

/** A full-width seasonal banner: photograph with the copy on its left, like the hero but quieter. */
export default function SeasonBanner({ home }: { home: HomepageSettings }) {
  if (!home.bannerTitle) return null
  return (
    <section aria-labelledby="home-banner-title" className="relative isolate overflow-hidden bg-parchment text-ink">
      {home.bannerImage ? (
        <Image src={home.bannerImage} alt={home.bannerImageAlt} fill sizes="100vw" className="-z-10 object-cover object-[70%_18%]" unoptimized={home.bannerImage.startsWith('/api/media/')} />
      ) : null}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-bone/95 via-bone/60 to-transparent md:bg-gradient-to-r md:from-bone/95 md:via-bone/50 md:to-transparent" />
      <div className="container-wide flex min-h-[420px] flex-col justify-end py-12 md:min-h-[clamp(320px,26vw,420px)] md:justify-center">
        <div className="max-w-md">
          {home.bannerEyebrow ? <p className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-ink/70">{home.bannerEyebrow}</p> : null}
          <h2 id="home-banner-title" className="mt-3 font-serif text-[clamp(2rem,3.6vw,3.25rem)] font-normal leading-[1.04]">
            {home.bannerTitle}
          </h2>
          {home.bannerBody ? <p className="mt-4 text-[1rem] text-ink/80">{home.bannerBody}</p> : null}
          {home.bannerCtaLabel ? (
            <div className="mt-7">
              <SquareLink href={home.bannerCtaHref}>{home.bannerCtaLabel}</SquareLink>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
