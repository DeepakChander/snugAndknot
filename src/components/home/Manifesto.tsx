'use client'

import Image from 'next/image'
import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion/gsap'
import { useSettings } from '@/components/providers/SettingsProvider'
import { ButtonLink } from '@/components/kit/Button'

const INLINE = ['/images/collection-home/Material-Intimacy.png', '/images/products/women/ivory-cable-cardigan-2.jpg']

/**
 * The brand manifesto from settings. Words ink in from 15% to full as you scroll, and two
 * small photographs sit inside the line of text like set type.
 */
export default function Manifesto() {
  const { homepage } = useSettings()
  const root = useRef<HTMLElement>(null)
  const words = homepage.manifesto.split(/\s+/).filter(Boolean)
  const slots = new Set([Math.min(4, words.length - 1), Math.min(Math.floor(words.length * 0.62), words.length - 1)])

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const ws = root.current?.querySelectorAll('[data-w]')
      if (!ws?.length) return
      gsap.fromTo(
        ws,
        { opacity: 0.12 },
        { opacity: 1, ease: 'none', stagger: 0.05, scrollTrigger: { trigger: root.current?.querySelector('[data-text]'), start: 'top 75%', end: 'bottom 45%', scrub: 0.6 } }
      )
      gsap.fromTo(
        root.current!.querySelectorAll('[data-pic]'),
        { scale: 0.4, rotate: -8 },
        { scale: 1, rotate: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'top 30%', scrub: 0.8 } }
      )
    },
    { scope: root }
  )

  let pic = 0
  return (
    <section ref={root} className="section-pad relative bg-ivory text-ink">
      <div className="container-wide">
        <p className="text-eyebrow text-burgundy">The atelier creed</p>
        <p data-text className="mt-8 max-w-[22ch] text-[clamp(2.3rem,5.4vw,5.6rem)] font-display leading-[1.02] tracking-[-0.025em] md:max-w-[24ch]">
          {words.map((w, i) => (
            <span key={i}>
              <span data-w className="inline-block">
                {w}
              </span>{' '}
              {slots.has(i) && pic < INLINE.length ? (
                <span data-pic className="relative mx-1 inline-block h-[0.78em] w-[1.5em] -translate-y-[0.06em] overflow-hidden rounded-full align-middle">
                  <Image src={INLINE[pic++]} alt="" fill sizes="120px" className="object-cover" />
                </span>
              ) : null}
            </span>
          ))}
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-6">
          <ButtonLink href="/about" variant="outline" arrow>
            Read our story
          </ButtonLink>
          <p className="max-w-sm text-sm text-stone">Every piece is knitted in small runs and finished by hand — buttons sewn, seams pressed, tags tied.</p>
        </div>
      </div>
    </section>
  )
}
