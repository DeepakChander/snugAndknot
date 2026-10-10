'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, prefersReducedMotion, setPageReady } from '@/lib/motion/gsap'
import { lockScroll, unlockScroll } from '@/lib/motion/lenis'

const WORDS = ['Carding', 'Spinning', 'Dyeing', 'Knitting', 'Finishing']
const KEY = 'sk-preloaded'

/** A figure-eight knot drawn in one continuous gold thread. */
export function KnotMark({ className, strokeWidth = 1.6 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
      <path
        data-knot
        d="M60 18c-17 0-29 11-29 25 0 18 22 23 29 37 7 14-3 26-17 24-13-2-18-17-9-27 9-10 31-10 40 0 9 10 4 25-9 27-14 2-24-10-17-24 7-14 29-19 29-37 0-14-12-25-29-25z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Preloader() {
  const root = useRef<HTMLDivElement>(null)
  const [done, setDone] = useState(false)

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
    const path = el.querySelector<SVGPathElement>('[data-knot]')!
    const len = path.getTotalLength()
    const counterEl = el.querySelector<HTMLElement>('[data-count]')!
    const bar = el.querySelector<HTMLElement>('[data-bar]')!
    const letters = el.querySelectorAll<HTMLElement>('[data-letter]')
    const words = el.querySelectorAll<HTMLElement>('[data-word]')

    const assetsReady = Promise.race([
      Promise.all([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => (document.readyState === 'complete' ? r(null) : window.addEventListener('load', () => r(null), { once: true })))]),
      new Promise((r) => setTimeout(r, 3500)),
    ])

    const ctx = gsap.context(() => {
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
      gsap.set(letters, { yPercent: 110 })
      gsap.set(words, { yPercent: 100, opacity: 0 })

      const intro = gsap.timeline()
      intro
        .to(path, { strokeDashoffset: 0, duration: 2.2, ease: 'power2.inOut' }, 0)
        .to(letters, { yPercent: 0, duration: 1.1, stagger: 0.045, ease: 'expo.out' }, 0.25)
        .to(counter, {
          v: 86,
          duration: 1.9,
          ease: 'power2.inOut',
          onUpdate: () => {
            counterEl.textContent = String(Math.round(counter.v)).padStart(3, '0')
            bar.style.transform = `scaleX(${counter.v / 100})`
          },
        }, 0)
      words.forEach((w, i) => {
        intro.to(w, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power3.out' }, 0.2 + i * 0.38)
        if (i < words.length - 1) intro.to(w, { yPercent: -100, opacity: 0, duration: 0.3, ease: 'power3.in' }, 0.2 + i * 0.38 + 0.3)
      })

      intro.add(() => {
        assetsReady.then(() => {
          const out = gsap.timeline({
            onComplete: () => {
              unlockScroll()
              setDone(true)
            },
          })
          out
            .to(counter, {
              v: 100,
              duration: 0.45,
              ease: 'power2.out',
              onUpdate: () => {
                counterEl.textContent = String(Math.round(counter.v)).padStart(3, '0')
                bar.style.transform = `scaleX(${counter.v / 100})`
              },
            })
            .to(letters, { yPercent: -110, duration: 0.7, stagger: 0.025, ease: 'power3.in' }, '+=0.1')
            .to(path, { opacity: 0, scale: 0.9, duration: 0.6, ease: 'power3.in', transformOrigin: '50% 50%' }, '<')
            .to(el.querySelectorAll('[data-fade]'), { opacity: 0, duration: 0.4 }, '<')
            .add(() => setPageReady(true), '-=0.15')
            .to(el, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.1, ease: 'curtain' }, '-=0.1')
        })
      })
    }, el)

    return () => {
      ctx.revert()
      unlockScroll()
    }
  }, [])

  if (done) return null

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-noir text-bone"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      data-chrome
      aria-hidden
    >
      <div className="relative flex flex-col items-center gap-8">
        <KnotMark className="h-28 w-28 text-gold md:h-36 md:w-36" strokeWidth={1.2} />
        <div className="flex overflow-hidden font-display text-[clamp(2.75rem,8vw,6.5rem)] leading-[0.9] tracking-[-0.03em]">
          {'Snug'.split('').map((c, i) => (
            <span key={`s${i}`} data-letter className="inline-block">
              {c}
            </span>
          ))}
          <span data-letter className="inline-block px-[0.06em] italic text-gold">
            &amp;
          </span>
          {'Knot'.split('').map((c, i) => (
            <span key={`k${i}`} data-letter className="inline-block">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div data-fade className="absolute bottom-8 left-[var(--gutter)] h-4 overflow-hidden text-eyebrow text-taupe">
        <div className="relative h-4 w-40">
          {WORDS.map((w) => (
            <span key={w} data-word className="absolute left-0 top-0">
              {w}
            </span>
          ))}
        </div>
      </div>
      <div data-fade className="absolute bottom-7 right-[var(--gutter)] font-mono text-sm tabular-nums text-bone/80">
        <span data-count>000</span>
      </div>
      <div data-fade className="absolute bottom-0 left-0 right-0 h-px bg-bone/10">
        <div data-bar className="h-full origin-left scale-x-0 bg-gold" />
      </div>
    </div>
  )
}
