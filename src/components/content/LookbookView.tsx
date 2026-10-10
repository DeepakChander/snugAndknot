'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion/gsap'
import SplitReveal from '@/components/motion/SplitReveal'
import { ButtonLink } from '@/components/kit/Button'

export interface Spread {
  id: string
  title: string
  subtitle: string
  description: string
  season: string
  images: { src: string; alt: string }[]
}

// Collage slots: position (% of panel) and parallax depth.
const SLOTS = [
  { cls: 'left-[38%] top-[12%] w-[26vw] aspect-[3/4]', depth: 0.1 },
  { cls: 'left-[66%] top-[8%] w-[22vw] aspect-[3/4]', depth: -0.18 },
  { cls: 'left-[58%] top-[56%] w-[24vw] aspect-[4/3]', depth: 0.28 },
]

export default function LookbookView({ spreads }: { spreads: Spread[] }) {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        if (prefersReducedMotion() || !track.current || !root.current) return
        const dist = () => track.current!.scrollWidth - window.innerWidth
        const tween = gsap.to(track.current, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.9, invalidateOnRefresh: true },
        })
        root.current.querySelectorAll<HTMLElement>('[data-depth]').forEach((el) => {
          const depth = Number(el.dataset.depth)
          gsap.fromTo(el, { xPercent: depth * 60 }, { xPercent: -depth * 60, ease: 'none', scrollTrigger: { trigger: el.closest('[data-panel]'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
        })
        const bar = root.current.querySelector('[data-progress]')
        if (bar) gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist()}`, scrub: true } })
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [spreads.length] }
  )

  return (
    <>
      <section data-nav-theme="dark" className="relative bg-noir pt-nav text-bone">
        <div className="container-wide pb-16 pt-14 md:pt-20">
          <p className="text-eyebrow text-gold">Lookbook · {String(spreads.length).padStart(2, '0')} stories</p>
          <SplitReveal as="h1" type="chars" intro className="mt-5 text-mega">
            The lookbook
          </SplitReveal>
          <p className="mt-8 max-w-xl text-lead text-bone/60">Five moods, one wardrobe. Knitwear photographed the way it is meant to be lived in.</p>
        </div>
      </section>

      <section ref={root} data-nav-theme="dark" className="relative overflow-hidden bg-noir text-bone" aria-label="Lookbook stories">
        <div ref={track} className="flex flex-col lg:h-[100svh] lg:w-max lg:flex-row">
          {spreads.map((s, i) => (
            <article key={s.id} data-panel className="relative flex min-h-[100svh] w-full shrink-0 flex-col justify-center px-gutter py-20 lg:h-[100svh] lg:w-screen lg:py-0">
              <div className="relative z-[2] max-w-md lg:w-[32vw]">
                <p className="font-mono text-sm text-gold">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-4 text-eyebrow text-bone/50">
                  {s.subtitle} · {s.season}
                </p>
                <h2 className="mt-4 text-display">{s.title}</h2>
                <p className="mt-6 text-bone/65">{s.description}</p>
                <ButtonLink href="/shop" variant="outline-light" size="sm" className="mt-8" arrow>
                  Shop the edit
                </ButtonLink>
              </div>
              {/* Mobile: simple stack */}
              <div className="mt-10 grid grid-cols-2 gap-3 lg:hidden">
                {s.images.slice(0, 3).map((img, j) => (
                  <div key={img.src} className={`relative overflow-hidden rounded-2xl bg-umber ${j === 0 ? 'col-span-2 aspect-[4/5]' : 'aspect-[3/4]'}`}>
                    <Image src={img.src} alt={img.alt} fill sizes="(max-width:1023px) 100vw, 0px" className="object-cover" />
                  </div>
                ))}
              </div>
              {/* Desktop: layered collage moving at different depths */}
              {s.images.slice(0, 3).map((img, j) => (
                <div key={img.src} data-depth={SLOTS[j].depth} className={`absolute hidden overflow-hidden rounded-[1.5rem] bg-umber shadow-[0_50px_90px_-40px_rgba(0,0,0,0.9)] lg:block ${SLOTS[j].cls}`} data-cursor="view" data-cursor-label={s.title}>
                  <Image src={img.src} alt={img.alt} fill sizes="26vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] hover:scale-105" />
                </div>
              ))}
              <span className="pointer-events-none absolute bottom-10 left-[var(--gutter)] hidden font-display text-[16vw] leading-none text-bone/[0.04] lg:block" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
            </article>
          ))}
        </div>
        <div className="absolute inset-x-[var(--gutter)] bottom-8 hidden h-px bg-bone/15 lg:block">
          <div data-progress className="h-px origin-left bg-gold" />
        </div>
      </section>
    </>
  )
}
