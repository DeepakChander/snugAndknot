'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

/* ─── Promises data ─── */
const promises = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'If it frays, we failed.',
    description:
      'We have not failed. Every piece passes twelve points of tension testing before it leaves. If a single thread gives, the whole piece stays.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Tested at tensions your life will never reach.',
    description:
      'Every fiber is traceable to its origin coordinates. The thread that touches your skin has a name, a place, and a story we can tell you.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1M5.6 5.6l.7.7m12.1 12.1l.7.7M5.6 18.4l.7-.7M18.4 5.6l.7-.7" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    title: 'Guaranteed for the years you cannot yet imagine.',
    description:
      'Carbon-neutral delivery. Biodegradable packaging. Water-conscious looms. The knot holds only if the world around it does too.',
  },
]

/* ─── Knit-pattern SVG overlay (gold, subtle) ─── */
function KnitPatternOverlay() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id="knit-pattern-gold"
          x="0"
          y="0"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          {/* Interlocking V-shapes mimicking knit stitches */}
          <path
            d="M0 10 Q5 0 10 10 Q15 20 20 10"
            fill="none"
            stroke="#D4A853"
            strokeWidth="0.8"
          />
          <path
            d="M0 20 Q5 10 10 20 Q15 30 20 20"
            fill="none"
            stroke="#D4A853"
            strokeWidth="0.8"
          />
          <path
            d="M-10 10 Q-5 0 0 10"
            fill="none"
            stroke="#D4A853"
            strokeWidth="0.8"
          />
          <path
            d="M20 10 Q25 0 30 10"
            fill="none"
            stroke="#D4A853"
            strokeWidth="0.8"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#knit-pattern-gold)" />
    </svg>
  )
}

export default function QualityPromise() {
  const sectionRef = useRef<HTMLElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  /* ─── GSAP animations ─── */
  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      /* Parallax: horizontal -200px movement on the cards container */
      if (cardsContainerRef.current) {
        gsap.fromTo(
          cardsContainerRef.current,
          { x: 100 },
          {
            x: -100,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          }
        )
      }

      /* Staggered card entrance */
      const cards = sectionRef.current!.querySelectorAll('.promise-card')
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            delay: i * 0.15,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 72%',
            },
          }
        )
      })

      /* Icon pop-in */
      const icons = sectionRef.current!.querySelectorAll('.promise-icon')
      icons.forEach((icon, i) => {
        gsap.fromTo(
          icon,
          { scale: 0, rotation: -15 },
          {
            scale: 1,
            rotation: 0,
            duration: 0.7,
            delay: 0.25 + i * 0.15,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 72%',
            },
          }
        )
      })

      /* Divider lines draw in */
      const dividers = sectionRef.current!.querySelectorAll('.promise-divider')
      dividers.forEach((line) => {
        gsap.fromTo(
          line,
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden bg-parchment"
    >
      {/* ── Section header (above the dark strip) ── */}
      <div className="text-center mb-12 lg:mb-16 px-4">
        <p
          className="font-mono text-xs tracking-[0.3em] uppercase mb-4 text-gold"
        >
          The Knot That Holds
        </p>
        <h2
          className="font-heading text-4xl sm:text-5xl lg:text-6xl mb-4 text-burgundy"
        >
          This will not break.
        </h2>
        <p
          className="max-w-lg mx-auto text-sm leading-relaxed text-wine"
        >
          Three knots. Load-bearing. Non-negotiable.
        </p>
      </div>

      {/* ── Dark burgundy band — rotated -1deg for visual drama ── */}
      <div
        ref={stripRef}
        className="relative w-[110vw] -ml-[5vw] bg-burgundy"
        style={{
          transform: 'rotate(-1deg)',
          minHeight: '280px',
        }}
      >
        {/* Knit-pattern gold overlay */}
        <KnitPatternOverlay />

        {/* Promise cards — horizontal parallax target */}
        <div
          ref={cardsContainerRef}
          className="relative max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-14 lg:py-16"
        >
          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-0">
            {/* ── Dashed gold vertical dividers (desktop) ── */}
            <div
              className="promise-divider hidden lg:block absolute top-6 bottom-6 left-1/3 w-[1px]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, rgba(212,168,83,0.2) 0px, rgba(212,168,83,0.2) 6px, transparent 6px, transparent 12px)',
              }}
            />
            <div
              className="promise-divider hidden lg:block absolute top-6 bottom-6 left-2/3 w-[1px]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(to bottom, rgba(212,168,83,0.2) 0px, rgba(212,168,83,0.2) 6px, transparent 6px, transparent 12px)',
              }}
            />

            {promises.map((promise, i) => (
              <div
                key={promise.title}
                className="promise-card group relative px-6 lg:px-10"
              >
                {/* Knot number */}
                <span
                  className="font-mono text-[10px] tracking-[0.2em] mb-3 block"
                  style={{ color: 'rgba(212,168,83,0.4)' }}
                >
                  KNOT {String(i + 1).padStart(2, '0')}
                </span>

                {/* Icon */}
                <div
                  className="promise-icon w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-all duration-500"
                  style={{
                    backgroundColor: 'rgba(212,168,83,0.1)',
                    color: '#D4A853',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212,168,83,0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(212,168,83,0.1)'
                  }}
                >
                  {promise.icon}
                </div>

                {/* Title */}
                <h3
                  className="font-heading text-2xl mb-3 transition-colors duration-300 text-gold-pale"
                >
                  {promise.title}
                </h3>

                {/* Description */}
                <p
                  className="text-sm leading-[1.8]"
                  style={{ color: 'rgba(250,240,200,0.5)' }}
                >
                  {promise.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
