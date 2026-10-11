'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion/gsap'
import SplitReveal from '@/components/motion/SplitReveal'
import { ButtonLink } from '@/components/kit/Button'
import { cn } from '@/lib/format'

const STEPS = [
  {
    title: 'The fibre',
    body: 'Merino, cashmere blends and long-staple cotton — chosen by hand for softness, strength and the way they age.',
    image: '/images/collection-home/Material-Intimacy.png',
    tone: 'bg-butter text-ink',
  },
  {
    title: 'The knit',
    body: 'Cables, diamonds and fine-gauge jersey, knitted in short runs so every panel gets the attention it needs.',
    image: '/images/products/women/ivory-cable-cardigan-2.jpg',
    // A portrait shot in a wide card: hold the cable panel in frame.
    position: 'object-[50%_52%]',
    tone: 'bg-sage text-ink',
  },
  {
    title: 'The finish',
    body: 'Seams pressed, natural buttons sewn on one at a time, every piece checked before it is folded.',
    image: "/images/collection-home/Artisan's.png",
    tone: 'bg-clay text-ink',
  },
  {
    title: 'The life after',
    body: 'Made to be worn, washed and worn again — and to look better for it. Care notes come with every piece.',
    image: '/images/collection-home/Lived-In.png',
    tone: 'bg-plum text-bone',
  },
]

const PEEK = 4.4 // rem of each earlier card's label strip left showing above the next

/** The making of a piece as cards that stack like folded sweaters — every earlier title stays in view. */
export default function CraftCards() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const cards = gsap.utils.toArray<HTMLElement>('[data-card]', root.current)
      cards.forEach((card, i) => {
        const next = cards[i + 1]
        if (!next) return
        gsap.to(card.querySelector('[data-inner]'), {
          scale: 0.94,
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true },
        })
        gsap.to(card.querySelector('[data-dim]'), {
          opacity: 0.28,
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true },
        })
      })
    },
    { scope: root }
  )

  return (
    <section ref={root} data-nav-theme="light" aria-labelledby="craft-title" className="relative bg-ivory pb-[clamp(5rem,10vw,9rem)] text-ink">
      <div className="container-wide grid gap-6 pb-[clamp(2.5rem,5vw,4.5rem)] pt-[clamp(5rem,10vw,9rem)] md:grid-cols-12">
        <div className="md:col-span-8">
          <p className="text-eyebrow slash text-stone">How it&apos;s made</p>
          <SplitReveal as="h2" id="craft-title" className="mt-5 text-display">
            Four steps, <em>no shortcuts</em>
          </SplitReveal>
        </div>
        <div className="flex flex-col items-start justify-end gap-5 md:col-span-4 md:items-end md:text-right">
          <p className="max-w-xs text-stone">Between a skein of yarn and the piece you reach for every cold morning.</p>
          <ButtonLink href="/about" variant="outline" size="sm" arrow>
            Inside the atelier
          </ButtonLink>
        </div>
      </div>

      <div className="container-wide">
        {STEPS.map((s, i) => (
          <article
            key={s.title}
            data-card
            className="sticky"
            style={{ top: `calc(var(--nav-h) + 1rem + ${i * PEEK}rem)`, marginBottom: i < STEPS.length - 1 ? '14svh' : 0 }}
          >
            <div data-inner className="relative flex h-[min(76svh,740px)] min-h-[520px] origin-top flex-col overflow-hidden rounded-[1.75rem] bg-noir">
              {/* The coloured label strip — what stays visible when the next card stacks on top */}
              <header className={cn('flex h-[4.4rem] shrink-0 items-center justify-between gap-4 px-5 md:px-8', s.tone)}>
                <span className="font-mono text-sm tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="flex-1 text-[clamp(1.6rem,3.2vw,3rem)] font-semibold uppercase leading-none tracking-[-0.05em]">{s.title}</h3>
                <span className="text-label opacity-70">
                  {String(i + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
                </span>
              </header>
              <div className="relative min-h-0 flex-1">
                <Image src={s.image} alt="" fill sizes="(min-width: 768px) 92vw, 100vw" className={cn('object-cover', s.position)} />
                <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/10 to-transparent" />
                <p className="absolute bottom-0 left-0 max-w-xl p-5 text-[clamp(1.2rem,1.9vw,1.9rem)] font-medium leading-[1.2] tracking-[-0.025em] text-bone md:p-8">{s.body}</p>
              </div>
              <div data-dim className="pointer-events-none absolute inset-0 bg-noir opacity-0" aria-hidden />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
