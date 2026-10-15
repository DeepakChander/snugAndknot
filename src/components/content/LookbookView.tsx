'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion/gsap'
import { scrollToTarget } from '@/lib/motion/lenis'
import SplitReveal from '@/components/motion/SplitReveal'
import { ButtonLink } from '@/components/kit/Button'
import { ProductPrice } from '@/components/kit/Price'
import type { PriceBook } from '@/types/commerce'
import { accent, plain } from '@/lib/accent'
import { cn } from '@/lib/format'

export interface Spread {
  id: string
  title: string
  subtitle: string
  description: string
  season: string
  tone: string
  images: { src: string; alt: string }[]
  pieces: { handle: string; title: string; price: number; compareAtPrice: number | null; prices: PriceBook; image: string }[]
}

const TONES: Record<string, { bg: string; text: string; muted: string; nav: 'dark' | 'light' }> = {
  ink: { bg: 'bg-ink', text: 'text-bone', muted: 'text-bone/60', nav: 'dark' },
  sage: { bg: 'bg-sage', text: 'text-ink', muted: 'text-ink/80', nav: 'light' },
  butter: { bg: 'bg-butter', text: 'text-ink', muted: 'text-ink/65', nav: 'light' },
  clay: { bg: 'bg-clay', text: 'text-ink', muted: 'text-ink/80', nav: 'light' },
}

// Collage slots: two portraits and one landscape, each drifting at its own depth.
const SLOTS = [
  { cls: 'left-[40%] top-[13%] w-[23vw] aspect-[3/4] rotate-[-3deg]', depth: 0.1 },
  { cls: 'left-[67%] top-[9%] w-[20vw] aspect-[3/4] rotate-[2.5deg]', depth: -0.18 },
  { cls: 'left-[56%] top-[57%] w-[25vw] aspect-[16/10] rotate-[-1.5deg]', depth: 0.28 },
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
        root.current.querySelectorAll<HTMLElement>('[data-ghost]').forEach((el) => {
          gsap.fromTo(el, { xPercent: 30 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: el.closest('[data-panel]'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } })
        })
        const bar = root.current.querySelector('[data-progress]')
        if (bar) gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist()}`, scrub: true } })

        // While pinned the chapters sit side by side, so a chapter link scrolls the page to the point
        // where that panel fills the screen (panel i is i screen-widths into the pin).
        const st = tween.scrollTrigger!
        const chips = document.querySelectorAll<HTMLAnchorElement>('a[data-chapter]')
        const go = (e: MouseEvent) => {
          const a = e.currentTarget as HTMLAnchorElement
          const panel = document.getElementById(a.hash.slice(1))
          if (!panel) return
          e.preventDefault()
          scrollToTarget(st.start + panel.offsetLeft)
          history.replaceState(null, '', a.hash)
        }
        chips.forEach((c) => c.addEventListener('click', go))
        return () => chips.forEach((c) => c.removeEventListener('click', go))
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [spreads.length] }
  )

  return (
    <>
      <section data-nav-theme="light" className="relative overflow-hidden bg-ivory pt-nav text-ink">
        <div className="container-wide pb-14 pt-14 md:pb-20 md:pt-20">
          <p className="text-eyebrow slash text-stone">Lookbook · {String(spreads.length).padStart(2, '0')} chapters</p>
          <SplitReveal as="h1" type="chars" intro className="mt-5 text-mega">
            The lookbook
          </SplitReveal>
          <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
            <p className="max-w-xl text-lead text-stone md:col-span-6">
              Knitwear, worn where it belongs — on cold mornings, by the sea, every day — with the pieces from the shop in each chapter.
            </p>
            <ol className="flex flex-wrap gap-2 md:col-span-6 md:justify-end">
              {spreads.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} data-chapter className={cn('flex items-center gap-2 rounded-full px-3.5 py-2 text-label transition-transform hover:-translate-y-0.5', TONES[s.tone]?.bg ?? 'bg-parchment', TONES[s.tone]?.text)}>
                    <span className="opacity-80">{String(i + 1).padStart(2, '0')}</span>
                    {plain(s.title)}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* overflow-clip, not hidden: a hidden box is still scrollable, and an anchor jump or Tab focus into a
          later chapter would scroll the pinned track sideways and leave it offset until reload. */}
      <section ref={root} className="relative overflow-clip bg-ink" aria-label="Lookbook chapters">
        {/* Side by side only when motion is allowed; with reduced motion the chapters stack, as on phones. */}
        <div ref={track} className="flex flex-col motion-safe:lg:h-[100svh] motion-safe:lg:w-max motion-safe:lg:flex-row">
          {spreads.map((s, i) => {
            const tone = TONES[s.tone] ?? TONES.ink
            return (
              <article
                key={s.id}
                id={s.id}
                data-panel
                data-nav-theme={tone.nav}
                className={cn('relative flex min-h-[100svh] w-full shrink-0 flex-col justify-center overflow-hidden px-gutter pb-16 pt-28 lg:h-[100svh] lg:w-screen lg:py-0', tone.bg, tone.text)}
              >
                <span data-ghost className="pointer-events-none absolute -bottom-[4vw] right-[2vw] hidden font-display text-[30vw] font-[680] leading-none tracking-[-0.07em] opacity-[0.07] lg:block" aria-hidden>
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="relative z-[2] max-w-md lg:w-[34vw] lg:max-w-none">
                  <p className={cn('text-eyebrow slash', tone.muted)}>
                    {s.subtitle} · {s.season}
                  </p>
                  <h2 className="mt-5 font-display text-[clamp(3rem,6.6vw,7.5rem)] font-[650] uppercase leading-[0.86] tracking-[-0.06em]">{accent(s.title)}</h2>
                  <p className={cn('mt-6 max-w-sm text-[1.02rem] leading-relaxed', tone.muted)}>{s.description}</p>

                  {s.pieces.length ? (
                    <div className="mt-8">
                      <p className={cn('text-label', tone.muted)}>In this chapter</p>
                      <ul className="mt-3 flex flex-col gap-2">
                        {s.pieces.map((p) => (
                          <li key={p.handle}>
                            <Link
                              href={`/product/${p.handle}`}
                              className={cn(
                                'group flex items-center gap-3 rounded-full p-1.5 pr-5 transition-colors',
                                tone.nav === 'dark' ? 'bg-bone/10 hover:bg-bone/20' : 'bg-ink/[0.07] hover:bg-ink/[0.14]'
                              )}
                            >
                              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-parchment">
                                {p.image ? <Image src={p.image} alt="" fill sizes="40px" className="object-cover" /> : null}
                              </span>
                              <span className="min-w-0 flex-1 truncate font-display text-[0.98rem] font-semibold tracking-[-0.02em]">{p.title}</span>
                              <ProductPrice product={p} showCompareAt={false} className="text-[0.78rem]" />
                              <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <ButtonLink href="/about" variant={tone.nav === 'dark' ? 'outline-light' : 'outline'} size="sm" className="mt-8" arrow>
                      Read our story
                    </ButtonLink>
                  )}
                </div>

                {/* Mobile: a simple stack */}
                <div className="mt-10 grid grid-cols-2 gap-3 lg:hidden">
                  {s.images.slice(0, 3).map((img, j) => (
                    <div key={img.src} className={cn('relative overflow-hidden rounded-2xl bg-parchment', j === 2 ? 'col-span-2 aspect-[16/10]' : 'aspect-[3/4]')}>
                      <Image src={img.src} alt={img.alt} fill sizes={j === 2 ? '(max-width:1023px) 100vw, 0px' : '(max-width:1023px) 50vw, 0px'} className="object-cover" />
                    </div>
                  ))}
                </div>
                {/* Desktop: a collage drifting at different depths */}
                {s.images.slice(0, 3).map((img, j) => (
                  <div key={img.src} data-depth={SLOTS[j].depth} className={cn('absolute hidden lg:block', SLOTS[j].cls)}>
                    <div className="relative h-full w-full overflow-hidden rounded-[1.25rem] bg-parchment shadow-[0_50px_90px_-40px_rgba(0,0,0,0.55)]" data-cursor="view" data-cursor-label={plain(s.title)}>
                      <Image src={img.src} alt={img.alt} fill sizes="25vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] hover:scale-105" />
                    </div>
                  </div>
                ))}
              </article>
            )
          })}
        </div>
        <div className="pointer-events-none absolute inset-x-[var(--gutter)] bottom-8 z-[3] hidden h-[3px] overflow-hidden rounded-full bg-ink/15 lg:block">
          <div data-progress className="h-full origin-left bg-signal" />
        </div>
      </section>
    </>
  )
}
