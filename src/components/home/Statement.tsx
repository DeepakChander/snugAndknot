'use client'

import { useRef } from 'react'
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '@/lib/motion/gsap'
import { useSettings } from '@/components/providers/SettingsProvider'
import { ButtonLink } from '@/components/kit/Button'
import { accent } from '@/lib/accent'

function Badge() {
  const text = 'Hand-finished · Small batches · Natural fibres · '
  return (
    <div data-badge className="relative aspect-square w-[min(42vw,13rem)] max-w-full">
      <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
        <defs>
          <path id="badge-circle" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <text className="fill-current font-mono text-[13.5px] uppercase tracking-[0.14em]">
          <textPath href="#badge-circle">{text}</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[3.2rem] text-signal" aria-hidden>
        ✦
      </span>
    </div>
  )
}

/** Why the pieces are made this way — words fill in as you read, beside a turning badge. */
export default function Statement() {
  const { homepage } = useSettings()
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const text = root.current?.querySelector<HTMLElement>('[data-statement]')
      const badge = root.current?.querySelector<HTMLElement>('[data-badge]')
      if (!text || prefersReducedMotion()) return
      const split = SplitText.create(text, { type: 'words', autoSplit: true })
      gsap.fromTo(
        split.words,
        { opacity: 0.16 },
        { opacity: 1, ease: 'none', stagger: 0.06, scrollTrigger: { trigger: text, start: 'top 78%', end: 'bottom 50%', scrub: true } }
      )
      if (badge) gsap.to(badge, { rotation: 300, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.5 } })
      return () => split.revert()
    },
    { scope: root }
  )

  if (!homepage.manifesto) return null

  return (
    <section ref={root} data-nav-theme="light" aria-label="Why we make it this way" className="relative overflow-hidden bg-sage py-[clamp(6rem,12vw,11rem)] text-ink">
      <div className="container-wide grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <Badge />
        </div>
        <div className="md:col-span-9">
          <p className="text-eyebrow slash text-ink/80">Why we make it this way</p>
          <p data-statement className="mt-6 text-[clamp(2rem,4.4vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-balance">
            {accent(homepage.manifesto)}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink href="/about" variant="primary" size="md" arrow>
              Read our story
            </ButtonLink>
            <ButtonLink href="/care-instructions" variant="outline" size="md">
              Caring for knitwear
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  )
}
