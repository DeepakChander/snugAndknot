'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/motion/gsap'
import { ButtonLink } from '@/components/kit/Button'
import type { Collection } from '@/types/commerce'

// Hand-placed positions (vw / vh offsets from centre) so frames fly past on both sides.
const SPOTS = [
  { x: -24, y: -12 },
  { x: 22, y: 10 },
  { x: -18, y: 16 },
  { x: 26, y: -14 },
  { x: -4, y: -20 },
  { x: 6, y: 18 },
]

/**
 * Pinned 3D fly-through: each collection's photograph travels from deep in the frame
 * past the camera while the collection names slide across.
 */
export default function CollectionsFlythrough({ collections }: { collections: Collection[] }) {
  const root = useRef<HTMLElement>(null)
  const items = collections.slice(0, 6)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 768px)', () => {
        if (prefersReducedMotion() || !root.current) return
        const cards = root.current.querySelectorAll<HTMLElement>('[data-fly]')
        const titles = root.current.querySelectorAll<HTMLElement>('[data-title]')
        const n = cards.length
        const STEP = 0.95
        const LIFE = 1.8
        gsap.set(cards, { z: -2200, opacity: 0 })
        gsap.set(titles, { xPercent: 70, opacity: 0 })
        // Pin for exactly as long as the last photograph needs to pass the camera.
        ScrollTrigger.create({
          trigger: root.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * ((n - 1) * STEP + LIFE)}`,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        })
        cards.forEach((card, i) => {
          // z = 0 (natural size) is reached ~71% of the way through each flight; the name centres then.
          gsap
            .timeline({
              scrollTrigger: {
                trigger: root.current,
                start: () => `top+=${window.innerHeight * i * STEP} top`,
                end: () => `top+=${window.innerHeight * (i * STEP + LIFE)} top`,
                scrub: 1,
                invalidateOnRefresh: true,
              },
            })
            .fromTo(card, { z: -2200, opacity: 0 }, { z: 900, opacity: 1, ease: 'none', duration: 1 })
            .to(card, { opacity: 0, ease: 'none', duration: 0.18 }, 0.82)
            .fromTo(titles[i], { xPercent: 70, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'power2.out', duration: 0.5 }, 0.21)
            .to(titles[i], { xPercent: -70, opacity: 0, ease: 'power2.in', duration: 0.29 }, 0.71)
        })
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [items.length] }
  )

  return (
    <section ref={root} data-nav-theme="dark" className="relative overflow-hidden bg-noir text-bone" aria-label="Collections">
      {/* Desktop: 3D fly-through */}
      <div className="relative hidden h-[100svh] md:block">
        <div className="absolute inset-0 [perspective:900px]">
          <div className="absolute left-1/2 top-1/2 [transform-style:preserve-3d]">
            {items.map((c, i) => {
              const s = SPOTS[i % SPOTS.length]
              return (
                <Link
                  key={c.id}
                  href={`/collections/${c.handle}`}
                  data-fly
                  data-cursor="view"
                  data-cursor-label="Explore"
                  className="absolute block w-[clamp(220px,22vw,360px)] -translate-x-1/2 -translate-y-1/2 opacity-0"
                  style={{ left: `${s.x}vw`, top: `${s.y}vh` }}
                >
                  <span className="relative block aspect-[3/4] overflow-hidden rounded-[1.25rem] bg-umber shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
                    <Image src={c.image} alt={c.title} fill sizes="360px" className="object-cover" />
                  </span>
                  <span className="mt-3 block text-eyebrow text-gold-light">{c.subtitle}</span>
                </Link>
              )
            })}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
          {items.map((c) => (
            <p key={c.id} data-title className="absolute w-full text-center font-display text-[clamp(4rem,11vw,12rem)] leading-none tracking-[-0.04em] text-bone/[0.92] opacity-0 mix-blend-difference">
              {c.title}
            </p>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-8 flex items-center justify-between px-gutter">
          <p className="text-eyebrow text-bone/50">Collections · {String(items.length).padStart(2, '0')}</p>
          <ButtonLink href="/collections" variant="outline-light" size="sm" arrow>
            All collections
          </ButtonLink>
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <div className="section-pad container-wide md:hidden">
        <h2 className="text-headline">Collections</h2>
        <div className="mt-10 space-y-8">
          {items.map((c) => (
            <Link key={c.id} href={`/collections/${c.handle}`} className="block">
              <span className="relative block aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-umber">
                <Image src={c.image} alt={c.title} fill sizes="100vw" className="object-cover" />
              </span>
              <span className="mt-3 block text-eyebrow text-gold-light">{c.subtitle}</span>
              <span className="block font-display text-4xl">{c.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
