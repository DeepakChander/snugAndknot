'use client'

import { useRef, useLayoutEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import Link from 'next/link'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

/* ─── Chapter data ─────────────────────────────────────── */
const chapters = [
  {
    src: "/images/collection-home/Artisan's.png",
    alt: 'Artisan hands crafting textile on a wooden workbench',
    num: '01',
    label: 'Origin',
    heading: 'Hands that\nremember',
    quote: 'Where tradition meets nerve.',
    body: 'Every Snug & Knot piece begins in the hands of artisans who feel fabric the way musicians feel sound—every knot intentional, every tension deliberate.',
  },
  {
    src: '/images/collection-home/Material-Intimacy.png',
    alt: 'Close-up of cable-knit textile detail',
    num: '02',
    label: 'Process',
    heading: 'Woven, not\nassembled',
    quote: 'Where warp meets weft.',
    body: 'Our looms move at the speed of intention. There is no shortcut between the threads—every fiber earns its place or it doesn\'t stay.',
  },
  {
    src: '/images/collection-home/Lived-In.png',
    alt: 'Woman in cozy knit sweater by a sunlit window',
    num: '03',
    label: 'Wear',
    heading: 'Worn in,\nnot worn out',
    quote: 'Fabric that lives with you.',
    body: 'We stopped making fabric that compromises. Feel where the warp meets the weft—that resistance is intentional.',
  },
]

export default function BrandTeaser() {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  /* ─── Cursor glow follow (desktop only) ─────────────── */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reducedMotion || !cursorRef.current) return
      const rect = e.currentTarget.getBoundingClientRect()
      cursorRef.current.style.transform =
        `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px) translate(-50%, -50%)`
    },
    [reducedMotion]
  )

  /* ─── GSAP Animations ───────────────────────────────── */
  // useLayoutEffect ensures ctx.revert() runs synchronously before React
  // unmounts the DOM — preventing "removeChild" errors from ScrollTrigger's
  // pin-spacer wrapper conflicting with React's reconciliation.
  useLayoutEffect(() => {
    if (reducedMotion || !sectionRef.current || !trackRef.current) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      /* ══════ Desktop: Horizontal scroll cinema ══════ */
      mm.add('(min-width: 1024px)', () => {
        const track = trackRef.current!
        const panels = track.querySelectorAll<HTMLElement>('.chapter-panel')
        const totalScroll = track.scrollWidth - window.innerWidth

        // Main horizontal scroll tween
        const scrollTween = gsap.to(track, {
          x: -totalScroll,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: true,
            scrub: 0.6,
            end: () => `+=${totalScroll}`,
            invalidateOnRefresh: true,
          },
        })

        // Gold progress bar
        if (progressRef.current) {
          gsap.to(progressRef.current, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: () => `+=${totalScroll}`,
              scrub: true,
            },
          })
        }

        // Per-panel animations
        panels.forEach((panel) => {
          const imgContainer = panel.querySelector('.chapter-img-container')
          const imgInner = panel.querySelector('.chapter-img-inner')
          const ghostNum = panel.querySelector('.ghost-number')
          const label = panel.querySelector('.chapter-label')
          const line = panel.querySelector('.chapter-gold-line')
          const heading = panel.querySelector('.chapter-heading')
          const quote = panel.querySelector('.chapter-quote')
          const bodyText = panel.querySelector('.chapter-body')
          const cta = panel.querySelector('.chapter-cta')

          // Image: clip-path reveal + scale
          if (imgContainer) {
            gsap.fromTo(
              imgContainer,
              { clipPath: 'inset(15% 15% 15% 15%)', scale: 0.9 },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                scale: 1,
                ease: 'power3.out',
                duration: 1.5,
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: scrollTween,
                  start: 'left 85%',
                  end: 'left 40%',
                  scrub: true,
                },
              }
            )
          }

          // Image inner: parallax slide
          if (imgInner) {
            gsap.fromTo(
              imgInner,
              { x: '8%' },
              {
                x: '-8%',
                ease: 'none',
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: scrollTween,
                  start: 'left right',
                  end: 'right left',
                  scrub: true,
                },
              }
            )
          }

          // Ghost number: large background number
          if (ghostNum) {
            gsap.fromTo(
              ghostNum,
              { x: 200, opacity: 0 },
              {
                x: 0,
                opacity: 1,
                ease: 'expo.out',
                duration: 1.8,
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: scrollTween,
                  start: 'left 75%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
            // Slow parallax drift
            gsap.fromTo(
              ghostNum,
              { xPercent: 10 },
              {
                xPercent: -10,
                ease: 'none',
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: scrollTween,
                  start: 'left right',
                  end: 'right left',
                  scrub: true,
                },
              }
            )
          }

          // Label: slide in with blur
          if (label) {
            gsap.fromTo(
              label,
              { x: -40, opacity: 0, filter: 'blur(8px)' },
              {
                x: 0,
                opacity: 1,
                filter: 'blur(0px)',
                ease: 'expo.out',
                duration: 1,
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: scrollTween,
                  start: 'left 65%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          }

          // Gold accent line: draw in
          if (line) {
            gsap.fromTo(
              line,
              { scaleX: 0, transformOrigin: 'left center' },
              {
                scaleX: 1,
                ease: 'expo.out',
                duration: 1.4,
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: scrollTween,
                  start: 'left 62%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          }

          // Heading: 3D rotateX cascade
          if (heading) {
            const lines = heading.querySelectorAll('.heading-line')
            gsap.fromTo(
              lines,
              { rotateX: 90, y: 40, opacity: 0, transformOrigin: 'center bottom' },
              {
                rotateX: 0,
                y: 0,
                opacity: 1,
                stagger: 0.12,
                ease: 'expo.out',
                duration: 1.4,
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: scrollTween,
                  start: 'left 60%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          }

          // Quote: perspective slide
          if (quote) {
            gsap.fromTo(
              quote,
              { rotateY: 8, x: -30, opacity: 0, transformOrigin: 'left center' },
              {
                rotateY: 0,
                x: 0,
                opacity: 1,
                ease: 'expo.out',
                duration: 1.2,
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: scrollTween,
                  start: 'left 55%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          }

          // Body text: fade up
          if (bodyText) {
            gsap.fromTo(
              bodyText,
              { y: 30, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                ease: 'expo.out',
                duration: 1,
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: scrollTween,
                  start: 'left 50%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          }

          // CTA: spring in
          if (cta) {
            gsap.fromTo(
              cta,
              { y: 20, opacity: 0, scale: 0.95 },
              {
                y: 0,
                opacity: 1,
                scale: 1,
                ease: 'back.out(1.4)',
                duration: 0.8,
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: scrollTween,
                  start: 'left 45%',
                  toggleActions: 'play none none reverse',
                },
              }
            )
          }
        })

        // Decorative floating thread lines
        const threads = sectionRef.current!.querySelectorAll('.deco-thread')
        threads.forEach((thread, i) => {
          gsap.fromTo(
            thread,
            { xPercent: 20 + i * 10 },
            {
              xPercent: -20 - i * 10,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top top',
                end: () => `+=${totalScroll}`,
                scrub: true,
              },
            }
          )
        })
      })

      /* ══════ Mobile: Vertical reveal ══════ */
      mm.add('(max-width: 1023px)', () => {
        const panels = sectionRef.current!.querySelectorAll<HTMLElement>('.chapter-panel')

        panels.forEach((panel) => {
          const imgContainer = panel.querySelector('.chapter-img-container')
          const textEls = panel.querySelectorAll('.mob-reveal')

          if (imgContainer) {
            gsap.fromTo(
              imgContainer,
              { clipPath: 'inset(12% 12% 12% 12%)', scale: 0.92, opacity: 0 },
              {
                clipPath: 'inset(0% 0% 0% 0%)',
                scale: 1,
                opacity: 1,
                ease: 'expo.out',
                duration: 1.4,
                scrollTrigger: { trigger: panel, start: 'top 80%' },
              }
            )
          }

          if (textEls.length) {
            gsap.fromTo(
              textEls,
              { y: 40, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                stagger: 0.08,
                ease: 'expo.out',
                duration: 1,
                scrollTrigger: { trigger: panel, start: 'top 70%' },
              }
            )
          }
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden"
      style={{ background: '#0F0A0B' }}
    >
      {/* ── Knit texture overlay ──────────────────────────── */}
      <div className="absolute inset-0 knit-pattern-gold pointer-events-none z-[1]" />

      {/* ── Decorative thread lines (parallax) ────────────── */}
      <div className="deco-thread absolute top-[15%] left-0 right-0 h-[1px] z-[1] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.08), transparent)' }}
      />
      <div className="deco-thread absolute top-[45%] left-0 right-0 h-[1px] z-[1] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.06), transparent)' }}
      />
      <div className="deco-thread absolute top-[78%] left-0 right-0 h-[1px] z-[1] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(212,168,67,0.05), transparent)' }}
      />

      {/* ── Cursor glow (desktop) ─────────────────────────── */}
      <div
        ref={cursorRef}
        className="absolute z-[2] pointer-events-none hidden lg:block"
        style={{
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(241,225,148,0.04) 0%, transparent 65%)',
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'soft-light',
          willChange: 'transform',
        }}
      />

      {/* ── Gold progress bar (bottom of section) ─────────── */}
      <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-[2px] z-20">
        <div
          ref={progressRef}
          className="h-full origin-left"
          style={{
            transform: 'scaleX(0)',
            background: 'linear-gradient(90deg, #D4A843, #F1E194, #D4A843)',
          }}
        />
      </div>

      {/* ── Section intro label ───────────────────────────── */}
      <div className="lg:hidden px-6 pt-16 pb-6">
        <p className="font-mono text-[11px] tracking-[0.4em] uppercase text-gold/60">
          Our Story
        </p>
      </div>

      {/* ═══ Horizontal track (desktop) / Vertical stack (mobile) ═══ */}
      <div
        ref={trackRef}
        className="flex flex-col lg:flex-row lg:flex-nowrap relative z-10"
      >
        {chapters.map((chapter, i) => (
          <div
            key={i}
            className="chapter-panel flex-shrink-0 w-full lg:w-screen min-h-[auto] lg:min-h-screen relative flex flex-col lg:flex-row items-center px-6 sm:px-10 lg:px-0 py-10 lg:py-0"
          >
            {/* ── Ghost background number ───────────────── */}
            <div
              className="ghost-number hidden lg:block absolute z-0 select-none pointer-events-none"
              style={{
                top: '50%',
                left: i % 2 === 0 ? '8%' : 'auto',
                right: i % 2 !== 0 ? '8%' : 'auto',
                transform: 'translateY(-50%)',
                fontSize: 'clamp(12rem, 20vw, 22rem)',
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                lineHeight: 1,
                color: 'transparent',
                WebkitTextStroke: '1px rgba(212,168,67,0.07)',
              }}
            >
              {chapter.num}
            </div>

            {/* ── Image side ────────────────────────────── */}
            <div
              className={`relative w-full lg:w-[52%] ${
                i % 2 === 0 ? 'lg:order-1' : 'lg:order-2'
              } ${i % 2 === 0 ? 'lg:pl-16 lg:pr-8' : 'lg:pl-8 lg:pr-16'}`}
            >
              <div className="chapter-img-container relative overflow-hidden rounded-2xl lg:rounded-3xl shadow-2xl"
                style={{ aspectRatio: '4/3' }}
              >
                <div className="chapter-img-inner absolute inset-[-16%] w-[132%] h-[132%]">
                  <Image
                    src={chapter.src}
                    alt={chapter.alt}
                    fill
                    quality={85}
                    priority={i === 0}
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 52vw"
                  />
                </div>

                {/* Image overlay gradient */}
                <div
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    background: `linear-gradient(${
                      i % 2 === 0 ? '135deg' : '225deg'
                    }, rgba(15,10,11,0.35) 0%, transparent 60%)`,
                  }}
                />

                {/* Corner accent */}
                <div
                  className="absolute top-6 z-10 pointer-events-none"
                  style={{
                    [i % 2 === 0 ? 'left' : 'right']: '24px',
                  }}
                >
                  <p className="font-mono text-[10px] tracking-[0.4em] uppercase text-gold/70">
                    {chapter.num} — {chapter.label}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Text side ─────────────────────────────── */}
            <div
              className={`relative w-full lg:w-[48%] ${
                i % 2 === 0 ? 'lg:order-2 lg:pl-12 lg:pr-20' : 'lg:order-1 lg:pl-20 lg:pr-12'
              } mt-8 lg:mt-0 flex items-center`}
            >
              <div className="max-w-lg" style={{ perspective: '1000px' }}>
                {/* Label */}
                <p className="chapter-label mob-reveal font-mono text-[11px] tracking-[0.4em] uppercase text-gold/60 mb-4">
                  {chapter.label}
                </p>

                {/* Gold line */}
                <div
                  className="chapter-gold-line mob-reveal h-[2px] w-14 mb-8 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #D4A843, #F1E194, transparent)',
                  }}
                />

                {/* Heading - split by newlines for 3D cascade */}
                <div className="chapter-heading mb-6" style={{ perspective: '800px' }}>
                  {chapter.heading.split('\n').map((line, li) => (
                    <span
                      key={li}
                      className="heading-line mob-reveal block font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] text-gold-pale leading-[1.08] will-change-transform"
                    >
                      {line}
                    </span>
                  ))}
                </div>

                {/* Pull quote */}
                <div style={{ perspective: '800px' }}>
                  <p
                    className="chapter-quote mob-reveal text-lg sm:text-xl font-heading italic mb-6 border-l-2 pl-5 py-1"
                    style={{
                      borderColor: 'rgba(212,168,67,0.4)',
                      color: 'rgba(241,225,148,0.65)',
                    }}
                  >
                    &ldquo;{chapter.quote}&rdquo;
                  </p>
                </div>

                {/* Body */}
                <p className="chapter-body mob-reveal text-sm sm:text-base text-gold-pale/50 leading-relaxed mb-8">
                  {chapter.body}
                </p>

                {/* CTA (only on last chapter) */}
                {i === chapters.length - 1 && (
                  <Link
                    href="/about"
                    className="chapter-cta mob-reveal group inline-flex items-center gap-3 px-7 py-3.5 rounded-full border border-gold/25 text-gold text-sm font-medium transition-all duration-400 hover:bg-gold/10 hover:border-gold/50 hover:shadow-[0_4px_24px_rgba(212,168,67,0.15)]"
                  >
                    <span>Unravel the full story</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* ── Final CTA panel (desktop only) ─────────── */}
        <div className="hidden lg:flex chapter-panel flex-shrink-0 w-[60vw] min-h-screen items-center justify-center relative">
          <div className="text-center" style={{ perspective: '800px' }}>
            <p className="font-mono text-[11px] tracking-[0.5em] uppercase text-gold/40 mb-6">
              The Thread Continues
            </p>
            <h3 className="font-heading text-4xl xl:text-5xl text-gold-pale mb-4 leading-tight">
              Every thread has<br />a story to tell
            </h3>
            <div
              className="h-[2px] w-12 mx-auto mb-8 rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, #D4A843, transparent)' }}
            />
            <Link
              href="/about"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gold text-burgundy-deep font-medium text-sm rounded-full overflow-hidden transition-all duration-300 hover:bg-burgundy hover:text-gold hover:shadow-[0_8px_32px_rgba(241,225,148,0.25)]"
            >
              <span>Explore Our World</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Decorative corner gold arcs */}
          <div className="absolute top-12 right-12 w-24 h-24 border-t border-r border-gold/10 rounded-tr-3xl pointer-events-none" />
          <div className="absolute bottom-12 left-12 w-24 h-24 border-b border-l border-gold/10 rounded-bl-3xl pointer-events-none" />
        </div>
      </div>

      {/* ── Mobile CTA ────────────────────────────────────── */}
      <div className="lg:hidden flex justify-center pb-16 pt-4">
        <Link
          href="/about"
          className="group inline-flex items-center gap-3 px-7 py-3.5 bg-gold text-burgundy-deep font-medium text-sm rounded-full transition-all duration-300 hover:bg-burgundy hover:text-gold"
        >
          <span>Explore Our World</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
