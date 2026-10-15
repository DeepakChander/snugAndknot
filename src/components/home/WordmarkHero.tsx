'use client'

import { useId, useRef, type CSSProperties } from 'react'
import { gsap, SplitText, ScrollTrigger, useGSAP, prefersReducedMotion, isTouch, whenPageReady } from '@/lib/motion/gsap'
import { getLenis } from '@/lib/motion/lenis'
import { useSettings } from '@/components/providers/SettingsProvider'
import { ButtonLink } from '@/components/kit/Button'
import { accent, plain } from '@/lib/accent'
import CareSymbols from './CareSymbols'

/* ─────────────── The stitch fill ───────────────
   A tile of stockinette: two columns of V-shaped stitches, sixteen rows tall, with one Fair Isle band
   (deep red, terracotta, gold) across it. Each leg is an ellipse leaning in toward the stitch below,
   the left leg catching more light than the right. */
const LEGS = {
  b: ['#c43f27', '#a3301c'],
  d: ['#8f2817', '#76200f'],
  t: ['#e7a487', '#cd876a'],
  g: ['#e3cf7f', '#c4ab52'],
} as const
const knitTile = (rows: readonly (readonly [string, string])[], ground: string, edge: string) => {
  const leg = (x: number, y: number, a: number, fill: string) =>
    `<ellipse cx='${x}' cy='${y}' rx='2.5' ry='4.4' transform='rotate(${a} ${x} ${y})' fill='${fill}'/>`
  const h = rows.length * 8
  let s = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 ${h}' width='20' height='${h}'><rect width='20' height='${h}' fill='${ground}'/><g stroke='${edge}' stroke-width='0.5'>`
  rows.forEach(([l, r], i) => {
    for (const cx of [5, 15]) s += leg(cx - 2.3, i * 8 + 4, -24, l) + leg(cx + 2.3, i * 8 + 4, 24, r)
  })
  s += '</g></svg>'
  return `url("data:image/svg+xml,${s.replace(/#/g, '%23').replace(/</g, '%3C').replace(/>/g, '%3E')}")`
}
/** The letters: burgundy stockinette with one band. */
const KNIT = knitTile(
  'bbbbbdtggtdbbbbb'.split('').map((k) => LEGS[k as keyof typeof LEGS]),
  '#4f150b',
  '#3b0f07'
)
/** The dark that opens between the words: the same stitch, tone on tone. */
const KNIT_NOIR = knitTile([['#1f1d1a', '#181614']], '#0f0e0d', '#0a0908')

/* ─────────────── The courses ───────────────
   Rows of small type behind the wordmark — the fibres and pieces the shop sells — running in
   alternate directions like knitted courses. Purl rows in serif, knit rows in mono. */
const COURSES = [
  'Merino',
  'Cashmere blends',
  'Long-staple cotton',
  'Cardigans',
  'Knit tees',
  'Hand-finished',
  'Small runs',
  'Merino-cotton',
  'A touch of silk',
  'Cable knit',
  'Knit tops',
  'Finished by hand',
]
const ROWS = Array.from({ length: 11 }, (_, r) => {
  const start = (r * 5) % COURSES.length
  const words = [...COURSES.slice(start), ...COURSES.slice(0, start)]
  const serif = r % 2 === 1
  const sep = serif ? ' × ' : ' / '
  return {
    serif,
    // Each half is far wider than any screen; the track holds two and slides by one.
    half: Array(3).fill(words.join(sep)).join(sep) + sep,
    dur: 64 + ((r * 3) % 5) * 12,
    delay: -((r * 13) % 40),
    rev: r % 2 === 1,
  }
})

const SVG = 'http://www.w3.org/2000/svg'

type Stitch = { word: HTMLElement; svg: SVGSVGElement; thread: SVGPathElement; seam: SVGPathElement }

/** A running-stitch underline for one accent word, drawn by a mask whose thread is revealed with stroke-dashoffset. */
function makeStitch(word: HTMLElement, id: string): Stitch {
  const svg = document.createElementNS(SVG, 'svg')
  svg.setAttribute('class', 'hero-stitch')
  svg.setAttribute('aria-hidden', 'true')
  const mask = document.createElementNS(SVG, 'mask')
  mask.setAttribute('id', id)
  mask.setAttribute('maskUnits', 'userSpaceOnUse')
  const thread = document.createElementNS(SVG, 'path')
  thread.setAttribute('fill', 'none')
  thread.setAttribute('stroke', '#fff')
  thread.setAttribute('pathLength', '1')
  thread.setAttribute('stroke-dasharray', '1 1')
  thread.style.strokeDashoffset = '1'
  mask.appendChild(thread)
  const seam = document.createElementNS(SVG, 'path')
  seam.setAttribute('fill', 'none')
  seam.setAttribute('stroke', 'currentColor')
  seam.setAttribute('stroke-linecap', 'round')
  seam.setAttribute('mask', `url(#${id})`)
  svg.append(mask, seam)
  word.appendChild(svg)
  return { word, svg, thread, seam }
}

/** Sizes a stitch to its word: a gentle wave, stitches a fixed fraction of the type size. */
function layoutStitch({ word, svg, thread, seam }: Stitch) {
  const fs = parseFloat(getComputedStyle(word).fontSize) || 16
  const w = word.offsetWidth + fs * 0.08
  const h = fs * 0.24
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  svg.setAttribute('width', `${w}`)
  svg.setAttribute('height', `${h}`)
  const y = h / 2
  const step = fs * 0.42
  let d = `M${fs * 0.03} ${y}`
  for (let x = fs * 0.03, up = true; x < w - fs * 0.03; x += step, up = !up) {
    const nx = Math.min(x + step, w - fs * 0.03)
    d += ` Q${(x + nx) / 2} ${up ? y - h * 0.22 : y + h * 0.22} ${nx} ${y}`
  }
  for (const p of [thread, seam]) p.setAttribute('d', d)
  thread.setAttribute('stroke-width', `${h * 2}`)
  seam.setAttribute('stroke-width', `${fs * 0.042}`)
  seam.setAttribute('stroke-dasharray', `${fs * 0.13} ${fs * 0.085}`)
}

/**
 * Home hero — the wordmark set in knitted letters. Each letter of SNUG / KNOT is filled with a vector
 * stockinette that slowly feeds through it, over rows of small type that run like knitted courses.
 * Scrolling parts the two words; the gap between them opens into the dark, the courses pull tight,
 * and the campaign copy is stitched in word by word.
 */
export default function WordmarkHero() {
  const { homepage, store } = useSettings()
  const root = useRef<HTMLElement>(null)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [first, second] = store.name.includes('&') ? store.name.split('&') : [store.name, '']

  useGSAP(
    () => {
      const el = root.current
      if (!el) return
      const stage = el.querySelector<HTMLElement>('[data-stage]')!
      const wordA = el.querySelector<HTMLElement>('[data-word="a"]')!
      const wordB = el.querySelector<HTMLElement>('[data-word="b"]')!
      const flood = el.querySelector<HTMLElement>('[data-flood]')!
      const rows = el.querySelectorAll<HTMLElement>('[data-course]')
      const tracks = el.querySelectorAll<HTMLElement>('[data-course-track]')
      // The rail has two layers: the outer one fades with scroll, the inner one plays the intro,
      // so an unfinished intro can never undo the scroll fade.
      const rail = el.querySelector<HTMLElement>('[data-rail]')!
      const railIn = el.querySelector<HTMLElement>('[data-rail-in]')!
      const copy = el.querySelectorAll<HTMLElement>('[data-copy]')
      const eyebrow = el.querySelector<HTMLElement>('[data-copy="eyebrow"]')!
      const title = el.querySelector<HTMLElement>('[data-copy="title"]')!
      const sub = el.querySelector<HTMLElement>('[data-copy="sub"]')!
      const ctas = el.querySelector<HTMLElement>('[data-copy="ctas"]')!

      if (prefersReducedMotion()) {
        // The CSS (motion-reduce) already shows the settled hero: the copy on the dark ground.
        wordA.classList.remove('split-pending')
        wordB.classList.remove('split-pending')
        el.dataset.navTheme = 'dark'
        return
      }

      // Split the wordmark into letters, each carrying its own piece of the stitch fill.
      const splits = [wordA, wordB].map((w) =>
        SplitText.create(w, { type: 'chars', mask: 'chars', charsClass: 'knit-char', aria: 'none' })
      )
      const chars = splits.flatMap((s) => s.chars as HTMLElement[])
      const masks = chars.map((c) => c.parentElement as HTMLElement)
      gsap.set(chars, { yPercent: 115 })
      for (const w of [wordA, wordB]) w.classList.add('is-split')
      wordA.classList.remove('split-pending')
      wordB.classList.remove('split-pending')

      // The title, word by word; accent words get a running stitch beneath them.
      const titleSplit = SplitText.create(title, { type: 'words', wordsClass: 'hero-word', aria: 'none' })
      title.classList.add('is-split')
      const words = titleSplit.words as HTMLElement[]
      const stitches = words.filter((w) => w.closest('em')).map((w, i) => makeStitch(w, `${uid}-stitch-${i}`))

      // Line every letter's stitches up with the word's, so the fabric runs on across the letters.
      const measure = () => {
        for (let i = 0; i < chars.length; i++) {
          chars[i].style.setProperty('--kx', `${-masks[i].offsetLeft}px`)
          chars[i].style.setProperty('--ky', `${-masks[i].offsetTop}px`)
        }
        stitches.forEach(layoutStitch)
      }
      measure()
      document.fonts?.ready.then(measure)
      window.addEventListener('resize', measure)

      gsap.set(tracks, { autoAlpha: 0 })
      gsap.set(railIn, { autoAlpha: 0, y: 12 })

      // Intro — the courses knit in from the middle row outward while the letters rise out of their masks.
      const unsub = whenPageReady(() => {
        gsap
          .timeline()
          .to(chars, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.05 })
          .to(tracks, { autoAlpha: 1, duration: 1.4, ease: 'power2.out', stagger: { each: 0.07, from: 'center' } }, 0.15)
          .to(railIn, { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out' }, 0.6)
      })

      // Pointer — letters near the cursor lift and stretch a little, like a stitch being pulled.
      let offPointer = () => {}
      if (!isTouch()) {
        const lift = masks.map((m) => gsap.quickTo(m, 'yPercent', { duration: 0.6, ease: 'power3.out' }))
        const pull = masks.map((m) => gsap.quickTo(m, 'scaleY', { duration: 0.6, ease: 'power3.out' }))
        gsap.set(masks, { transformOrigin: '50% 100%' })
        const move = (e: PointerEvent) => {
          masks.forEach((m, i) => {
            const r = m.getBoundingClientRect()
            const reach = Math.max(r.width * 1.4, 1)
            const dx = (e.clientX - (r.left + r.width / 2)) / reach
            const dy = Math.max(0, Math.abs(e.clientY - (r.top + r.height / 2)) - r.height / 2) / reach
            const k = Math.exp(-(dx * dx + dy * dy) * 2.2)
            lift[i](-7 * k)
            pull[i](1 + 0.07 * k)
          })
        }
        const leave = () =>
          masks.forEach((_, i) => {
            lift[i](0)
            pull[i](1)
          })
        stage.addEventListener('pointermove', move)
        stage.addEventListener('pointerleave', leave)
        offPointer = () => {
          stage.removeEventListener('pointermove', move)
          stage.removeEventListener('pointerleave', leave)
        }
      }

      // Drifting stops while the hero is off screen or once the words have parted.
      let inView = true
      let parted = false
      const idle = () => el.classList.toggle('hero-idle', !inView || parted)
      const visibility = ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          inView = self.isActive
          idle()
        },
      })

      // Scroll — the words part, the dark opens between them, then the copy is stitched in.
      const seam = () => {
        const a = wordA.offsetTop + wordA.offsetHeight
        const b = wordB.offsetTop
        return (a + b) / 2
      }
      gsap.set(copy, { pointerEvents: 'none' })
      gsap.set([eyebrow, sub, ctas], { opacity: 0, y: 24 })
      gsap.set(title, { opacity: 1 })
      gsap.set(words, { opacity: 0, yPercent: 55, rotate: 3 })
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            el.dataset.navTheme = self.progress > 0.42 ? 'dark' : 'light'
            const p = self.progress > 0.5
            if (p !== parted) {
              parted = p
              idle()
            }
          },
        },
      })
      tl.fromTo(
        flood,
        { clipPath: () => `inset(${seam()}px 0px ${stage.clientHeight - seam()}px 0px)` },
        // Overshooting the stage by the same margin as the words keeps the edges tucked under the letters.
        { clipPath: () => `inset(${-stage.clientHeight * 0.15}px 0px ${-stage.clientHeight * 0.15}px 0px)`, duration: 0.45, ease: 'power2.in' },
        0
      )
        .to(wordA, { y: () => -(wordA.offsetTop + wordA.offsetHeight + stage.clientHeight * 0.15), rotate: -3, scale: 1.06, duration: 0.45, ease: 'power2.in' }, 0)
        .to(wordB, { y: () => stage.clientHeight * 1.15 - wordB.offsetTop, rotate: 3, scale: 1.06, duration: 0.45, ease: 'power2.in' }, 0)
        .to(
          rows,
          {
            y: (_: number, row: HTMLElement) => (stage.clientHeight / 2 - (row.offsetTop + row.offsetHeight / 2)) * 0.55,
            opacity: 0,
            duration: 0.4,
          },
          0
        )
        .to(rail, { autoAlpha: 0, duration: 0.12 }, 0)
        .to(eyebrow, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' }, 0.46)

      // Title words, one after another; each accent word's stitch runs in just after it lands.
      const each = Math.min(0.035, 0.22 / Math.max(words.length, 1))
      words.forEach((w, i) => {
        tl.to(w, { opacity: 1, yPercent: 0, rotate: 0, duration: 0.09, ease: 'power2.out' }, 0.5 + i * each)
        const s = stitches.find((st) => st.word === w)
        if (s) tl.to(s.thread, { strokeDashoffset: 0, duration: 0.1, ease: 'power1.inOut' }, 0.5 + i * each + 0.05)
      })
      const after = 0.5 + words.length * each
      tl.to(sub, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' }, Math.max(after, 0.7))
        .to(ctas, { opacity: 1, y: 0, duration: 0.1, ease: 'power2.out' }, Math.max(after + 0.06, 0.78))
        // Clickable only once visible (keyboard focus is unaffected by pointer-events).
        .set(copy, { pointerEvents: 'auto' }, Math.max(after + 0.14, 0.86))
        .to({}, { duration: 0.06 })

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
        offPointer()
        visibility.kill()
        window.removeEventListener('resize', measure)
        copy.forEach((c) => c.removeEventListener('focusin', reveal))
        el.classList.remove('hero-idle')
        title.classList.remove('is-split')
        titleSplit.revert()
        for (const w of [wordA, wordB]) w.classList.remove('is-split')
        splits.forEach((s) => s.revert())
      }
    },
    { scope: root }
  )

  const knit = { '--knit': KNIT } as CSSProperties
  const word = 'knit-word split-pending relative font-[680] uppercase leading-[0.8] tracking-[-0.07em] text-[clamp(4.5rem,33vw,25rem)] md:text-[min(24vw,42svh)]'

  return (
    <section
      ref={root}
      data-nav-theme="light"
      aria-label={`${store.name} — hand-finished knitwear`}
      className="relative h-[230svh] bg-ivory text-ink motion-reduce:h-[100svh]"
    >
      <div data-stage className="sticky top-0 h-[100svh] overflow-hidden">
        <h1 className="sr-only">{`${store.name} — ${plain(homepage.heroTitle)}`}</h1>

        {/* Courses */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 flex flex-col justify-between py-[7svh] motion-reduce:hidden">
          {ROWS.map((row, r) => (
            <div key={r} data-course className="w-full">
              <div
                data-course-track
                data-dir={row.rev ? 'rev' : undefined}
                style={{ '--dur': `${row.dur}s`, animationDelay: `${row.delay}s` } as CSSProperties}
                className={
                  row.serif
                    ? 'course-track invisible flex w-max whitespace-pre font-accent text-[clamp(1.05rem,1.9vw,1.75rem)] italic leading-none text-burgundy/35 opacity-0'
                    : 'course-track invisible flex w-max whitespace-pre font-mono text-[clamp(0.6rem,0.85vw,0.78rem)] uppercase leading-none tracking-[0.14em] text-ink/35 opacity-0'
                }
              >
                <span>{row.half}</span>
                <span>{row.half}</span>
              </div>
            </div>
          ))}
        </div>

        {/* The dark that opens between the words */}
        <div
          data-flood
          aria-hidden
          style={{ backgroundImage: KNIT_NOIR, backgroundSize: '22px 8.8px' }}
          className="absolute inset-0 z-[1] bg-noir [clip-path:inset(50%_0_50%_0)] motion-reduce:[clip-path:none]"
        />

        {/* The wordmark */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[2] flex flex-col justify-center gap-[3vw] px-gutter motion-reduce:hidden md:gap-0" style={knit}>
          <p data-word="a" className={`${word} md:pl-[3vw]`}>
            {first}
          </p>
          <p data-word="b" className={`${word} text-right md:pr-[3vw]`}>
            {second || ' '}
          </p>
        </div>

        {/* Campaign copy */}
        <div className="pointer-events-none absolute inset-0 z-[3] flex items-center px-gutter pb-[max(1.5rem,4vh)] pt-nav text-bone">
          <div className="grid w-full items-end gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p data-copy="eyebrow" className="text-eyebrow slash text-butter opacity-0 motion-reduce:pointer-events-auto motion-reduce:opacity-100">
                {homepage.heroEyebrow}
              </p>
              <h2
                data-copy="title"
                aria-hidden
                className="hero-title mt-5 max-w-[16ch] opacity-0 text-[clamp(2.6rem,7vw,7.5rem)] font-semibold leading-[1] tracking-[-0.05em] text-balance motion-reduce:pointer-events-auto motion-reduce:opacity-100 [&_em]:text-gold-light"
              >
                {accent(homepage.heroTitle)}
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p data-copy="sub" className="max-w-sm text-lead text-bone/80 opacity-0 motion-reduce:pointer-events-auto motion-reduce:opacity-100">
                {homepage.heroSubtitle}
              </p>
              <div data-copy="ctas" className="mt-7 flex flex-wrap gap-3 opacity-0 motion-reduce:pointer-events-auto motion-reduce:opacity-100">
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

        {/* Label rail */}
        <div data-rail className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] motion-reduce:hidden">
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
