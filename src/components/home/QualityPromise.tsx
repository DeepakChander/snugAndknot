'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

const promises = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    title: 'Quality Guaranteed',
    description: 'Every garment undergoes 12-point quality inspection before shipping. If it doesn\'t meet our standards, it doesn\'t ship.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: 'Traceable Origins',
    description: 'Know where your clothes come from. Every fiber is traceable to its source — from farm to finished garment.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1M5.6 5.6l.7.7m12.1 12.1l.7.7M5.6 18.4l.7-.7M18.4 5.6l.7-.7" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    title: 'Sustainable Process',
    description: 'Carbon-neutral shipping, biodegradable packaging, and water-conscious manufacturing. Fashion that respects the planet.',
  },
]

export default function QualityPromise() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      const cards = sectionRef.current!.querySelectorAll('.promise-card')

      cards.forEach((card, i) => {
        // Staggered slide in from right
        gsap.fromTo(card,
          { opacity: 0, x: 60, rotateY: 10 },
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            duration: 1,
            delay: i * 0.15,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        )

        // Icon pulse animation
        const icon = card.querySelector('.promise-icon')
        if (icon) {
          gsap.fromTo(icon,
            { scale: 0, rotation: -20 },
            {
              scale: 1,
              rotation: 0,
              duration: 0.8,
              delay: 0.3 + i * 0.15,
              ease: 'back.out(2)',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 70%',
              },
            }
          )
        }
      })

      // Center line draws down
      const centerLine = sectionRef.current!.querySelector('.promise-center-line')
      if (centerLine) {
        gsap.fromTo(centerLine,
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            duration: 1.5,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="relative py-28 lg:py-36 bg-cream overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-24">
          <p className="font-mono text-xs text-terracotta tracking-[0.3em] uppercase mb-4">Our Promise</p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-4">
            Built on Trust
          </h2>
          <p className="text-walnut max-w-lg mx-auto text-sm leading-relaxed">
            Three commitments that define everything we do, from sourcing to delivery.
          </p>
        </div>

        {/* Promise cards */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-0">
          {/* Vertical dividers (desktop only) */}
          <div className="promise-center-line hidden lg:block absolute top-8 bottom-8 left-1/3 w-[1px] bg-gradient-to-b from-transparent via-beige to-transparent" />
          <div className="promise-center-line hidden lg:block absolute top-8 bottom-8 left-2/3 w-[1px] bg-gradient-to-b from-transparent via-beige to-transparent" />

          {promises.map((promise, i) => (
            <div
              key={promise.title}
              className="promise-card group relative px-8 lg:px-12 perspective-[800px]"
            >
              {/* Icon */}
              <div className="promise-icon w-14 h-14 rounded-xl bg-charcoal/5 flex items-center justify-center text-charcoal mb-6 group-hover:bg-terracotta/10 group-hover:text-terracotta transition-all duration-500">
                {promise.icon}
              </div>

              {/* Number */}
              <span className="font-mono text-[10px] text-charcoal/50 tracking-[0.2em] mb-3 block">
                PROMISE {String(i + 1).padStart(2, '0')}
              </span>

              {/* Title */}
              <h3 className="font-heading text-2xl text-charcoal mb-3 group-hover:text-terracotta transition-colors duration-300">
                {promise.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-walnut leading-[1.8]">
                {promise.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
