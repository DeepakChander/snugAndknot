'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

/* ── Generative SVG Knot ── */
function DecorativeKnotSVG() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full knot-svg"
      aria-hidden="true"
    >
      {/* Outer intertwined loop — burgundy */}
      <path
        d="M200 40 C280 40, 360 100, 360 180 C360 260, 280 340, 200 340
           C120 340, 80 300, 100 240 C120 180, 200 160, 240 200
           C280 240, 240 300, 200 300 C160 300, 140 260, 160 220"
        stroke="var(--color-burgundy)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1200"
        strokeDashoffset="1200"
        className="knot-path-1"
        opacity="0.85"
      />

      {/* Inner mirror loop — gold */}
      <path
        d="M200 360 C120 360, 40 300, 40 220 C40 140, 120 60, 200 60
           C280 60, 320 100, 300 160 C280 220, 200 240, 160 200
           C120 160, 160 100, 200 100 C240 100, 260 140, 240 180"
        stroke="var(--color-gold)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="1200"
        strokeDashoffset="1200"
        className="knot-path-2"
        opacity="0.7"
      />

      {/* Accent weave — wine */}
      <path
        d="M120 120 C160 80, 240 80, 280 120 C320 160, 320 240, 280 280
           C240 320, 160 320, 120 280 C80 240, 80 160, 120 120Z"
        stroke="var(--color-wine)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeDasharray="900"
        strokeDashoffset="900"
        className="knot-path-3"
        opacity="0.3"
        fill="none"
      />

      {/* Center node — gold muted */}
      <circle
        cx="200"
        cy="200"
        r="6"
        fill="var(--color-gold-muted)"
        className="knot-center"
        opacity="0"
      />

      {/* Smaller accent circles at crossover points */}
      <circle cx="160" cy="200" r="3" fill="var(--color-burgundy)" opacity="0" className="knot-dot knot-dot-1" />
      <circle cx="240" cy="200" r="3" fill="var(--color-gold)" opacity="0" className="knot-dot knot-dot-2" />
      <circle cx="200" cy="160" r="3" fill="var(--color-wine)" opacity="0" className="knot-dot knot-dot-3" />
      <circle cx="200" cy="240" r="3" fill="var(--color-gold-muted)" opacity="0" className="knot-dot knot-dot-4" />
    </svg>
  )
}

export default function ConnectWithUs() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  // GSAP entrance animations
  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      // Content fade in from left
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, x: -60 },
          {
            opacity: 1,
            x: 0,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        )
      }

      // Visual area fade in from right
      if (visualRef.current) {
        gsap.fromTo(
          visualRef.current,
          { opacity: 0, x: 60, rotateY: 15 },
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            duration: 1.4,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        )
      }

      // Animate contact items with stagger
      const contactItems = sectionRef.current!.querySelectorAll('.contact-item')
      contactItems.forEach((item, i) => {
        gsap.fromTo(
          item,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            delay: 0.8 + i * 0.15,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        )
      })

      // Animate SVG knot paths drawing in
      const knotPaths = sectionRef.current!.querySelectorAll('.knot-path-1, .knot-path-2, .knot-path-3')
      knotPaths.forEach((path, i) => {
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 2.5,
          delay: 0.6 + i * 0.4,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        })
      })

      // Animate center dot and accent dots
      gsap.to('.knot-center', {
        opacity: 1,
        scale: 1,
        duration: 0.6,
        delay: 2.2,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      })

      const knotDots = sectionRef.current!.querySelectorAll('.knot-dot')
      knotDots.forEach((dot, i) => {
        gsap.to(dot, {
          opacity: 0.6,
          duration: 0.4,
          delay: 2.4 + i * 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="relative py-32 lg:py-44 bg-gradient-to-b from-ivory via-parchment to-ivory overflow-hidden"
    >
      {/* Ambient background blurs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-burgundy/8 blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-gold/6 blur-[120px]" />
      </div>

      {/* Subtle grid — burgundy at very low opacity */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-burgundy) 1px, transparent 1px), linear-gradient(90deg, var(--color-burgundy) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          opacity: 0.015,
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* ── Left: Heading staircase + contact info ── */}
          <div ref={contentRef}>
            {/* Section tag with pulsing dot */}
            <div className="flex items-center gap-3 mb-8">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-gold" />
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-gold animate-ping" />
              </div>
              <p className="font-mono text-xs text-gold tracking-[0.4em] uppercase font-bold">
                The Other End
              </p>
            </div>

            {/* Heading — burgundy */}
            <h2 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-burgundy mb-8 leading-[1.05] tracking-tight">
              You are holding
              <br />
              one end.
            </h2>

            {/* Body text — wine */}
            <p className="text-lg text-wine leading-relaxed mb-10 max-w-lg">
              Here is the other. Every thread has two ends.
              The connection already exists &mdash; this is where you make it taut.
            </p>

            {/* Contact items */}
            <div className="space-y-5 mb-12">
              <a
                href="mailto:hello@snugandknot.com"
                className="contact-item group flex items-center gap-4 text-burgundy hover:text-gold transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-ivory/80 border border-burgundy/10 group-hover:border-gold/30 group-hover:bg-gold/5 flex items-center justify-center transition-all duration-500 group-hover:scale-110">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-rosewood/70 uppercase tracking-wider font-mono mb-1">Written Thread</p>
                  <p className="font-semibold text-base text-burgundy group-hover:text-gold transition-colors duration-500">
                    hello@snugandknot.com
                  </p>
                </div>
              </a>

              <a
                href="tel:+919355704093"
                className="contact-item group flex items-center gap-4 text-burgundy hover:text-gold transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-ivory/80 border border-burgundy/10 group-hover:border-gold/30 group-hover:bg-gold/5 flex items-center justify-center transition-all duration-500 group-hover:scale-110">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-rosewood/70 uppercase tracking-wider font-mono mb-1">Spoken Thread</p>
                  <p className="font-semibold text-base text-burgundy group-hover:text-gold transition-colors duration-500">
                    +91-9355704093
                  </p>
                </div>
              </a>
            </div>

            {/* CTA button — burgundy bg, gold text, hover inverts */}
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 px-12 py-5 bg-burgundy text-gold text-sm font-bold rounded-full hover:bg-gold hover:text-burgundy transition-all duration-500 hover:shadow-[0_25px_70px_-20px_rgba(241,225,148,0.6)]"
            >
              <span className="uppercase tracking-wide">Pass the thread</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="transition-transform duration-500 group-hover:translate-x-2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* ── Right: Generative SVG knot visual ── */}
          <div ref={visualRef} className="relative perspective-[1200px]" style={{ transformStyle: 'preserve-3d' }}>
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-parchment/60 backdrop-blur-sm border border-burgundy/10 shadow-2xl flex items-center justify-center p-10">
              <DecorativeKnotSVG />
            </div>

            {/* Decorative glows */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-burgundy/15 blur-[80px] -z-10 animate-[knot-glow_8s_ease-in-out_infinite]" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-gold/12 blur-[80px] -z-10 animate-[knot-glow_10s_ease-in-out_infinite_reverse]" />
          </div>
        </div>
      </div>
    </section>
  )
}
