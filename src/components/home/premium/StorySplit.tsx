import Image from 'next/image'
import type { HomepageSettings } from '@/types/commerce'
import SquareLink from './SquareLink'

/** The brand story: a photograph on one half, the copy and a signature line on the other. */
export default function StorySplit({ home }: { home: HomepageSettings }) {
  if (!home.storyTitle && !home.storyBody) return null
  return (
    <section aria-labelledby="home-story-title" className="grid bg-bone text-ink md:grid-cols-2">
      <div className="relative aspect-[5/4] md:aspect-auto md:min-h-[480px]">
        {home.storyImage ? (
          <Image src={home.storyImage} alt={home.storyImageAlt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover object-[center_40%]" unoptimized={home.storyImage.startsWith('/api/media/')} />
        ) : null}
      </div>
      <div className="flex items-center px-gutter py-14 md:px-[clamp(2.5rem,6vw,6rem)] md:py-20">
        <div className="max-w-lg">
          {home.storyEyebrow ? <p className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-stone">{home.storyEyebrow}</p> : null}
          <h2 id="home-story-title" className="mt-4 font-serif text-[clamp(2rem,3.4vw,3rem)] font-normal leading-[1.08]">
            {home.storyTitle}
          </h2>
          {home.storyBody ? <p className="mt-6 text-[0.98rem] leading-relaxed text-ink/80">{home.storyBody}</p> : null}
          {home.storySignature ? <p className="mt-6 font-accent text-[1.6rem] italic text-ink/90">{home.storySignature}</p> : null}
          {home.storyCtaLabel ? (
            <div className="mt-8">
              <SquareLink href={home.storyCtaHref}>{home.storyCtaLabel}</SquareLink>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
