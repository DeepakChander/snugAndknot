'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, SplitText, useGSAP, prefersReducedMotion, whenPageReady } from '@/lib/motion/gsap'
import { getLenis } from '@/lib/motion/lenis'
import { useSettings } from '@/components/providers/SettingsProvider'
import { ButtonLink } from '@/components/kit/Button'
import { accent, plain } from '@/lib/accent'
import { cn } from '@/lib/format'
import CareSymbols from './CareSymbols'

/**
 * Home hero — an interlocked wordmark with a flip-book of real garments between the words
 * (SNUG behind the card, KNOT in front). Scrolling grows the card into a full-bleed photograph
 * while the words part, and the campaign copy rises over it.
 */
export default function WordmarkHero({ frames, cover }: { frames: string[]; cover: string }) {
  const { homepage, store } = useSettings()
  const root = useRef<HTMLElement>(null)
  const [frame, setFrame] = useState(0)
  const [flipping, setFlipping] = useState(true)
  // Until the intro has played only the first two frames exist, so the rest do not compete with the
  // first paint for bandwidth.
  const [warm, setWarm] = useState(false)
  // The full-bleed cover is only needed once the scroll starts; mounting it later keeps it from
  // competing with the first frame for bandwidth.
  const [showCover, setShowCover] = useState(false)
  // Frames that have finished loading: the flip-book only ever shows one of these, never a blank card.
  const loaded = useRef(new Set<number>())
  const markLoaded = useCallback((i: number) => loaded.current.add(i), [])
  const [first, second] = store.name.includes('&') ? store.name.split('&') : [store.name, '']

  // Flip-book: a new piece every 260ms while the card is small; it settles once it starts to grow.
  useEffect(() => {
    if (!warm || !flipping || frames.length < 2 || prefersReducedMotion()) return
    const t = setInterval(
      () =>
        setFrame((f) => {
          for (let step = 1; step < frames.length; step++) {
            const next = (f + step) % frames.length
            if (loaded.current.has(next)) return next
          }
          return f
        }),
      260
    )
    return () => clearInterval(t)
  }, [warm, flipping, frames.length])

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const stage = el.querySelector<HTMLElement>('[data-stage]')!
      const card = el.querySelector<HTMLElement>('[data-card]')!
      const shell = el.querySelector<HTMLElement>('[data-card-shell]')!
      const coverImg = el.querySelector<HTMLElement>('[data-cover]')!
      const media = el.querySelector<HTMLElement>('[data-media]')!
      const wordA = el.querySelector<HTMLElement>('[data-word="a"]')!
      const wordB = el.querySelector<HTMLElement>('[data-word="b"]')!
      // The rail has two layers: the outer one fades with scroll, the inner one plays the intro,
      // so an unfinished intro can never undo the scroll fade.
      const rail = el.querySelector<HTMLElement>('[data-rail]')!
      const railIn = el.querySelector<HTMLElement>('[data-rail-in]')!
      const copy = el.querySelectorAll<HTMLElement>('[data-copy]')
      const shade = el.querySelector<HTMLElement>('[data-shade]')!

      const inset = () => {
        const w = stage.clientWidth
        const h = stage.clientHeight
        const cw = Math.min(w * (w < 768 ? 0.56 : 0.25), 400)
        const ch = cw * 1.28
        return `inset(${(h - ch) / 2}px ${(w - cw) / 2}px ${(h - ch) / 2}px ${(w - cw) / 2}px round 18px)`
      }
      const full = 'inset(10px 10px 10px 10px round 26px)'

      if (prefersReducedMotion()) {
        wordA.classList.remove('split-pending')
        wordB.classList.remove('split-pending')
        gsap.set([shell, railIn], { autoAlpha: 1 })
        setShowCover(true)
        gsap.set(card, { clipPath: full, rotation: 0 })
        gsap.set([wordA, wordB, rail], { autoAlpha: 0 })
        gsap.set(coverImg, { autoAlpha: 1 })
        gsap.set(copy, { autoAlpha: 1 })
        gsap.set(shade, { autoAlpha: 1 })
        el.dataset.navTheme = 'dark'
        setFlipping(false)
        return
      }

      // Intro — letters rise out of their masks, the card drops in tilted.
      const splits = [wordA, wordB].map((w) => SplitText.create(w, { type: 'chars', mask: 'chars' }))
      const chars = splits.flatMap((s) => s.chars)
      gsap.set(chars, { yPercent: 115 })
      wordA.classList.remove('split-pending')
      wordB.classList.remove('split-pending')
      gsap.set(railIn, { autoAlpha: 0, y: 12 })
      const unsub = whenPageReady(() => {
        gsap
          .timeline({
            onComplete: () => {
              setWarm(true)
              setShowCover(true)
            },
          })
          .to(chars, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.05 })
          .to(railIn, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out' }, 0.6)
      })

      // Scroll — the card grows from a tilted portrait to the full stage.
      gsap.set(card, { clipPath: inset(), rotation: -9 })
      // Opacity only (not visibility), so the subtitle and buttons stay in the tab order and the
      // accessibility tree before the scroll reveals them.
      gsap.set(copy, { opacity: 0, yPercent: 40, pointerEvents: 'none' })
      gsap.set([coverImg, shade], { autoAlpha: 0 })
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setFlipping(self.progress < 0.08)
            if (self.progress > 0.005) setShowCover(true)
            el.dataset.navTheme = self.progress > 0.55 ? 'dark' : 'light'
          },
        },
      })
      tl.fromTo(card, { clipPath: inset, rotation: -9 }, { clipPath: full, rotation: 0, duration: 1 }, 0)
        .fromTo(media, { scale: 1.3 }, { scale: 1, duration: 1 }, 0)
        .to(coverImg, { autoAlpha: 1, duration: 0.12 }, 0.06)
        .to(wordA, { yPercent: -70, duration: 0.7 }, 0)
        .to(wordB, { yPercent: 90, autoAlpha: 0, duration: 0.6 }, 0)
        .to(rail, { autoAlpha: 0, duration: 0.15 }, 0)
        .to(shade, { autoAlpha: 1, duration: 0.25 }, 0.62)
        .to(copy, { opacity: 1, yPercent: 0, duration: 0.22, stagger: 0.05, ease: 'power2.out' }, 0.72)
        // Clickable only once visible (keyboard focus is unaffected by pointer-events).
        .set(copy, { pointerEvents: 'auto' }, 0.8)
        .to({}, { duration: 0.18 })

      // Tabbing onto the hero's buttons jumps the hero to its end, where they are fully shown.
      const reveal = () => {
        const st = tl.scrollTrigger
        if (!st || st.progress >= 0.95) return
        const lenis = getLenis()
        if (lenis) lenis.scrollTo(st.end, { immediate: true })
        else window.scrollTo(0, st.end)
      }
      copy.forEach((c) => c.addEventListener('focusin', reveal))

      return () => {
        unsub()
        copy.forEach((c) => c.removeEventListener('focusin', reveal))
        splits.forEach((s) => s.revert())
      }
    },
    { scope: root }
  )

  return (
    <section ref={root} data-nav-theme="light" aria-label={`${store.name} — hand-finished knitwear`} className="relative h-[230svh] bg-ivory text-ink">
      <div data-stage className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Back word */}
        <div className="pointer-events-none absolute inset-0 z-[1] flex flex-col justify-center px-gutter">
          <h1 className="sr-only">{`${store.name} — ${plain(homepage.heroTitle)}`}</h1>
          <p data-word="a" aria-hidden className="split-pending text-[clamp(5.5rem,26vw,25rem)] font-[680] uppercase leading-[0.8] tracking-[-0.07em] md:pl-[3vw] md:text-[24vw]">
            {first}
          </p>
          {/* Space for the card: on phones the words sit above and below it, tucked under its edges */}
          <div aria-hidden className="h-[80vw] md:h-[19.2vw]" />
        </div>

        {/* The card */}
        <div data-card-shell className="absolute inset-0 z-[2]">
          <div
            data-card
            className="absolute inset-0 rotate-[-9deg] overflow-hidden bg-parchment will-change-[clip-path,transform] [--ch:calc(var(--cw)*1.28)] [--cw:min(56vw,400px)] [clip-path:inset(calc(50%_-_var(--ch)/2)_calc(50%_-_var(--cw)/2)_round_18px)] md:[--cw:min(25vw,400px)]"
          >
            {/* Flip-book — sized exactly like the small card, so each garment shows whole */}
            <div className="absolute left-1/2 top-1/2 aspect-[1/1.28] w-[min(56vw,400px)] -translate-x-1/2 -translate-y-1/2 md:w-[min(25vw,400px)]">
              {(warm ? frames : frames.slice(0, 2)).map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, 56vw"
                  preload={i === 0}
                  onLoad={() => markLoaded(i)}
                  className={cn('object-cover', i === frame ? 'opacity-100' : 'opacity-0')}
                />
              ))}
            </div>
            <div data-media className="absolute inset-0">
              <div data-cover className="invisible absolute inset-0 opacity-0">
                {showCover ? <Image src={cover} alt="A hand resting on a hand-finished cable knit" fill sizes="(max-aspect-ratio: 11/6) 184vh, 100vw" className="object-cover object-[38%_50%]" /> : null}
              </div>
            </div>
            <div data-shade className="invisible absolute inset-0 bg-gradient-to-t from-noir/75 via-noir/15 to-noir/10 opacity-0" />

            {/* Campaign copy over the full-bleed photo */}
            <div className="absolute inset-x-0 bottom-0 z-[1] px-gutter pb-[max(2.5rem,6vh)] text-bone">
              <div className="grid items-end gap-8 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <p data-copy className="text-eyebrow slash text-butter opacity-0">
                    {homepage.heroEyebrow}
                  </p>
                  <h2 data-copy aria-hidden className="mt-5 max-w-[16ch] opacity-0 text-[clamp(2.6rem,6.4vw,7rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-balance">
                    {accent(homepage.heroTitle)}
                  </h2>
                </div>
                <div className="lg:col-span-4">
                  <p data-copy className="max-w-sm text-lead text-bone/80 opacity-0">
                    {homepage.heroSubtitle}
                  </p>
                  <div data-copy className="mt-7 flex flex-wrap gap-3 opacity-0">
                    <ButtonLink href={homepage.primaryCtaHref || '/shop'} variant="light" size="lg" arrow magnetic>
                      {homepage.primaryCtaLabel || 'Shop new in'}
                    </ButtonLink>
                    {homepage.secondaryCtaLabel ? (
                      <ButtonLink href={homepage.secondaryCtaHref || '/collections'} variant="outline-light" size="lg">
                        {homepage.secondaryCtaLabel}
                      </ButtonLink>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Front word */}
        <div className="pointer-events-none absolute inset-0 z-[3] flex flex-col justify-center px-gutter">
          {/* Space for the card: on phones the words sit above and below it, tucked under its edges */}
          <div aria-hidden className="h-[80vw] md:h-[19.2vw]" />
          <p data-word="b" aria-hidden className="split-pending text-right text-[clamp(5.5rem,26vw,25rem)] font-[680] uppercase leading-[0.8] tracking-[-0.07em] md:pr-[3vw] md:text-[24vw]">
            {second || ' '}
          </p>
        </div>

        {/* Label rail */}
        <div data-rail className="pointer-events-none absolute inset-x-0 bottom-0 z-[4]">
          <div data-rail-in className="invisible grid grid-cols-2 items-end px-gutter pb-[5.25rem] text-label text-ink/75 opacity-0 sm:grid-cols-3 sm:pb-5">
            <CareSymbols className="text-[1.05rem] text-ink/70" />
            <span className="slash justify-self-end text-right sm:justify-self-center sm:text-center">{homepage.heroEyebrow}</span>
            <span className="hidden justify-self-end text-right sm:block sm:pr-20">Hand-finished in small batches</span>
          </div>
        </div>
      </div>
    </section>
  )
}
