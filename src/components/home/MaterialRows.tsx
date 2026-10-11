'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion/gsap'
import SplitReveal from '@/components/motion/SplitReveal'

type Word = { text: string; italic?: boolean } | { img: string }

/** What the pieces are made of — honest to the catalogue's fibre notes. */
const ROWS: { words: Word[]; drift: number }[] = [
  { drift: -18, words: [{ text: 'Merino' }, { img: '/images/products/women/ivory-cable-cardigan-2.jpg' }, { text: 'cashmere', italic: true }, { img: '/images/products/women/terracotta-textured-cardigan-2.jpg' }, { text: 'Cotton' }] },
  { drift: 14, words: [{ text: 'a touch of silk', italic: true }, { img: '/images/products/men/navy-tan-colorblock-tee-2.jpg' }, { text: 'Long-staple' }, { img: '/images/products/men/black-red-contrast-tee-2.jpg' }] },
  { drift: -12, words: [{ text: 'Small runs' }, { img: '/images/products/women/ivory-cable-cardigan-3.jpg' }, { text: 'finished by hand', italic: true }, { img: '/images/products/women/terracotta-textured-cardigan-3.jpg' }] },
]

/** Giant fibre words that drift sideways against each other as the page scrolls. */
export default function MaterialRows() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      root.current?.querySelectorAll<HTMLElement>('[data-row]').forEach((row) => {
        const drift = Number(row.dataset.drift)
        gsap.fromTo(
          row,
          { xPercent: drift * -0.5 },
          { xPercent: drift * 0.5, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: 0.6 } }
        )
      })
    },
    { scope: root }
  )

  return (
    <section ref={root} data-nav-theme="light" aria-labelledby="materials-title" className="relative overflow-hidden bg-butter py-[clamp(4.5rem,10vw,9rem)] text-ink">
      <div className="container-wide mb-[clamp(2.5rem,5vw,4.5rem)] grid gap-6 md:grid-cols-12">
        <p className="text-eyebrow slash text-ink/70 md:col-span-4">What we knit with</p>
        <SplitReveal as="h2" id="materials-title" className="max-w-[22ch] text-statement md:col-span-8">
          Natural fibres, knitted in small runs and <em>finished by hand</em> — nothing else.
        </SplitReveal>
      </div>

      <div aria-hidden className="space-y-1 md:space-y-2">
        {ROWS.map((row, r) => (
          <div key={r} className="flex justify-center">
            <div data-row data-drift={row.drift} className="flex shrink-0 items-center gap-[0.22em] whitespace-nowrap text-[clamp(3rem,9.6vw,10rem)] font-semibold uppercase leading-[0.92] tracking-[-0.055em]">
              {row.words.map((w, i) =>
                'img' in w ? (
                  <span key={i} className="relative inline-block h-[0.78em] w-[1.25em] shrink-0 overflow-hidden rounded-full bg-parchment ring-[0.035em] ring-ink">
                    <Image src={w.img} alt="" fill sizes="16vw" className="object-cover" />
                  </span>
                ) : (
                  <span key={i} className={w.italic ? 'font-accent font-normal normal-case italic tracking-[-0.02em]' : undefined}>
                    {w.text}
                  </span>
                )
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="container-wide mt-[clamp(2.5rem,5vw,4rem)] grid gap-2 text-label text-ink/70 md:grid-cols-3">
        <span className="slash">Merino &amp; merino-cotton</span>
        <span className="slash md:text-center">Cotton-cashmere blend</span>
        <span className="slash md:text-right">Long-staple cotton &amp; silk</span>
      </p>
    </section>
  )
}
