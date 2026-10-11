'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion, setPageReady } from '@/lib/motion/gsap'
import { lockScroll, unlockScroll } from '@/lib/motion/lenis'

const KEY = 'sk-preloaded'

// The real pieces and editorial frames, flicked through like a lookbook.
const FRAMES = [
  '/images/products/women/ivory-cable-cardigan-1.jpg',
  '/images/products/men/navy-tan-colorblock-tee-1.jpg',
  '/images/lookbook/quiet-luxury-1.png',
  '/images/products/women/terracotta-textured-cardigan-1.jpg',
  '/images/collection-home/Material-Intimacy.png',
  '/images/products/men/black-red-contrast-tee-1.jpg',
  '/images/lookbook/soft-focus-2.png',
  '/images/Collections-Hero/Winter.png',
]

const optimised = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=384&q=75`

/**
 * First visit of a session: "Snug" and "Knot" part while a small frame between them
 * flicks through the collection, a counter runs, then the curtain lifts.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(KEY) === '1'
    } catch {}
    if (seen || prefersReducedMotion() || !root.current) {
      setDone(true)
      setPageReady(true)
      return
    }
    try {
      sessionStorage.setItem(KEY, '1')
    } catch {}

    lockScroll()
    const el = root.current
    const counter = { v: 0 }
    const counterEl = el.querySelector<HTMLElement>('[data-count]')!
    const bar = el.querySelector<HTMLElement>('[data-bar]')!
    const left = el.querySelector<HTMLElement>('[data-left]')!
    const right = el.querySelector<HTMLElement>('[data-right]')!
    const win = el.querySelector<HTMLElement>('[data-window]')!
    const letters = el.querySelectorAll<HTMLElement>('[data-letter]')

    // Warm the cache so the flipbook never shows an empty frame.
    FRAMES.forEach((f) => {
      const img = new Image()
      img.src = optimised(f)
    })
    let i = 0
    const flip = setInterval(() => setFrame((i = (i + 1) % FRAMES.length)), 170)

    const assetsReady = Promise.race([
      Promise.all([
        document.fonts?.ready ?? Promise.resolve(),
        new Promise((r) => (document.readyState === 'complete' ? r(null) : window.addEventListener('load', () => r(null), { once: true }))),
      ]),
      new Promise((r) => setTimeout(r, 3500)),
    ])
    const paint = () => {
      counterEl.textContent = String(Math.round(counter.v)).padStart(3, '0')
      bar.style.transform = `scaleX(${counter.v / 100})`
    }

    const fill = el.querySelector<HTMLElement>('[data-fill]')!
    const fillImg = fill.querySelector<HTMLElement>('img')!

    // Only transforms, clip-paths and opacity move here: nothing changes the layout, so the curtain
    // adds no layout shift (CLS) to the first page of a visit.
    const ctx = gsap.context(() => {
      const half = win.offsetWidth / 2
      gsap.set(letters, { yPercent: 110 })
      gsap.set(win, { clipPath: 'inset(0% 50% 0% 50% round 16px)', opacity: 0 })
      // The words start together and part as the window opens.
      gsap.set(left, { x: half })
      gsap.set(right, { x: -half })
      const intro = gsap.timeline()
      intro
        .to(letters, { yPercent: 0, duration: 1.1, stagger: 0.05, ease: 'expo.out' }, 0.1)
        .to(win, { clipPath: 'inset(0% 0% 0% 0% round 16px)', opacity: 1, duration: 1, ease: 'expo.inOut' }, 0.55)
        .to([left, right], { x: 0, duration: 1, ease: 'expo.inOut' }, 0.55)
        .to(counter, { v: 88, duration: 2, ease: 'power2.inOut', onUpdate: paint }, 0)
        .add(() => {
          assetsReady.then(() => {
            gsap
              .timeline({
                onComplete: () => {
                  clearInterval(flip)
                  unlockScroll()
                  setDone(true)
                },
              })
              .to(counter, { v: 100, duration: 0.4, ease: 'power2.out', onUpdate: paint })
              .add(() => {
                clearInterval(flip)
                // A full-screen copy of the frame, clipped to the window's rectangle, takes over…
                const w = win.getBoundingClientRect()
                const r = el.getBoundingClientRect()
                gsap.set(fill, {
                  clipPath: `inset(${w.top - r.top}px ${r.right - w.right}px ${r.bottom - w.bottom}px ${w.left - r.left}px round 16px)`,
                  autoAlpha: 1,
                })
                // Start the copy at exactly the window's crop: object-cover scales by the larger ratio,
                // so the window shows the photo at k1 and the full screen at k2; scale by k1/k2 and
                // centre it on the window. Transforms only, so still no layout shift.
                const shown = win.querySelector('img')!
                const iw = shown.naturalWidth || 3
                const ih = shown.naturalHeight || 4
                const k1 = Math.max(w.width / iw, w.height / ih)
                const k2 = Math.max(r.width / iw, r.height / ih)
                gsap.set(fillImg, {
                  x: w.left + w.width / 2 - (r.left + r.width / 2),
                  y: w.top + w.height / 2 - (r.top + r.height / 2),
                  scale: k1 / k2,
                  transformOrigin: '50% 50%',
                })
              })
              // …and opens to fill the screen while the words part.
              .to(left, { xPercent: -60, opacity: 0, duration: 0.9, ease: 'expo.in' }, '+=0.05')
              .to(right, { xPercent: 60, opacity: 0, duration: 0.9, ease: 'expo.in' }, '<')
              .to(el.querySelectorAll('[data-fade]'), { opacity: 0, duration: 0.3 }, '<')
              .to(fill, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 1.1, ease: 'expo.inOut' }, '-=0.45')
              .to(fillImg, { x: 0, y: 0, scale: 1, duration: 1.1, ease: 'expo.inOut' }, '<')
              .add(() => setPageReady(true), '-=0.3')
              .to(el, { opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.15')
          })
        })
    }, el)

    return () => {
      clearInterval(flip)
      ctx.revert()
      unlockScroll()
    }
  }, [])

  if (done) return null

  return (
    <div ref={root} className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-ivory text-ink" data-chrome aria-hidden>
      <div className="flex items-center gap-[1.6vw] font-display text-[clamp(3rem,10.5vw,10rem)] font-[680] uppercase leading-[0.84] tracking-[-0.065em]">
        <span data-left className="flex overflow-hidden">
          {'Snug'.split('').map((c, i) => (
            <span key={i} data-letter className="inline-block">
              {c}
            </span>
          ))}
        </span>
        <span data-window className="relative block h-[clamp(110px,15vw,210px)] w-[clamp(84px,11vw,160px)] shrink-0 overflow-hidden rounded-[1rem] bg-parchment">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={optimised(FRAMES[frame])} alt="" className="absolute inset-0 h-full w-full object-cover" />
        </span>
        <span data-right className="flex overflow-hidden">
          <span data-letter className="inline-block pr-[0.06em] font-accent font-normal normal-case italic tracking-normal text-signal">
            &amp;
          </span>
          {'Knot'.split('').map((c, i) => (
            <span key={i} data-letter className="inline-block">
              {c}
            </span>
          ))}
        </span>
      </div>

      <div data-fill className="invisible absolute inset-0 z-[1] bg-parchment opacity-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={optimised(FRAMES[frame])} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>

      <p data-fade className="absolute bottom-8 left-[var(--gutter)] text-eyebrow slash text-stone">
        Knitwear, hand-finished
      </p>
      <p data-fade className="absolute bottom-7 right-[var(--gutter)] font-mono text-sm tabular-nums text-ink/80">
        <span data-count>000</span>
      </p>
      <div data-fade className="absolute bottom-0 left-0 right-0 h-[3px] bg-ink/10">
        <div data-bar className="h-full origin-left scale-x-0 bg-signal" />
      </div>
    </div>
  )
}
