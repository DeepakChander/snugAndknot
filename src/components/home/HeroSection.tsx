'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

/* ─── Lazy-load 3D canvas (SSR-safe) ─────────────────────── */
const HeroCanvas = dynamic(() => import('@/components/3d/HeroCanvas'), {
  ssr: false,
  loading: () => null,
})

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const cursorGlowRef = useRef<HTMLDivElement>(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const rafId = useRef<number>(0)
  const reducedMotion = useReducedMotion()

  const [scrollProgress, setScrollProgress] = useState(0)
  const [show3D, setShow3D] = useState(false)

  /* ─── Detect WebGL for 3D ───────────────────────────────── */
  useEffect(() => {
    if (reducedMotion) return
    try {
      const c = document.createElement('canvas')
      const gl = c.getContext('webgl2') || c.getContext('webgl')
      if (gl) setShow3D(true)
    } catch { /* no WebGL */ }
  }, [reducedMotion])

  /* ─── Scroll tracking ───────────────────────────────────── */
  useEffect(() => {
    if (!sectionRef.current) return
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => setScrollProgress(self.progress),
    })
    return () => trigger.kill()
  }, [])

  /* ─── GSAP scroll enhancements (parallax + exit fade) ──── */
  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      // Content parallax upward on scroll
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          y: -80,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        })
      }

      // Cinematic blur + fade on scroll exit
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          filter: 'blur(4px)',
          opacity: 0.2,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: '55% top',
            end: 'bottom top',
            scrub: 0.6,
          },
        })
      }
    })

    return () => ctx.revert()
  }, [reducedMotion])

  /* ─── Mouse interaction (cursor glow + subtle parallax) ── */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reducedMotion) return
      const rect = e.currentTarget.getBoundingClientRect()
      mousePos.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
      }
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.transform =
          `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px) translate(-50%, -50%)`
      }
    },
    [reducedMotion]
  )

  useEffect(() => {
    if (reducedMotion) return
    let active = true
    const animate = () => {
      if (!active) return
      const { x, y } = mousePos.current
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          x: -x * 6, y: -y * 4,
          duration: 2.5, ease: 'power2.out', overwrite: 'auto',
        })
      }
      rafId.current = requestAnimationFrame(animate)
    }
    rafId.current = requestAnimationFrame(animate)
    return () => { active = false; cancelAnimationFrame(rafId.current) }
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden"
      style={{ background: '#0F0A0B' }}
    >
      {/* ── Background: always-visible gradient ─────────────── */}
      <div
        className="hero-bg absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 25% 40%, #3D0A0E 0%, transparent 55%),
            radial-gradient(ellipse at 75% 65%, #5B0E14 0%, transparent 45%),
            radial-gradient(ellipse at 60% 20%, rgba(241,225,148,0.02) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, #1A0E10 0%, #0F0A0B 100%)
          `,
        }}
      />

      {/* ── Knit texture overlay ─────────────────────────────── */}
      <div className="absolute inset-0 z-[1] knit-pattern-gold pointer-events-none" />

      {/* ── 3D Canvas (subtle, behind content) ───────────────── */}
      {show3D && (
        <HeroCanvas scrollProgress={scrollProgress} isReady={true} />
      )}

      {/* ── Cursor glow (desktop) ────────────────────────────── */}
      <div
        ref={cursorGlowRef}
        className="absolute z-[2] pointer-events-none hidden lg:block"
        style={{
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(241,225,148,0.05) 0%, transparent 65%)',
          transform: 'translate(-50%, -50%)',
          mixBlendMode: 'soft-light',
          willChange: 'transform',
        }}
      />

      {/* ── Content ──────────────────────────────────────────── */}
      <div
        ref={contentRef}
        className="relative z-[3] flex flex-col justify-center min-h-screen px-6 sm:px-10 lg:px-16 py-24"
      >
        <div className="max-w-[920px]">
          {/* Season tag */}
          <span className="hero-tag inline-block mb-8 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/[0.06] text-gold font-mono text-[11px] tracking-[0.5em] uppercase">
            The First Fold
          </span>

          {/* Headline - visible by default via CSS animation */}
          <h1
            ref={headingRef}
            className="mb-8"
            style={{ perspective: '1200px', letterSpacing: '-0.02em' }}
          >
            {/* Line 1: Where tension */}
            <span className="hero-line block overflow-hidden">
              <span
                className="block font-heading font-bold text-gold-pale leading-[0.92]"
                style={{ fontSize: 'clamp(2.8rem, 2rem + 6.5vw, 9.5rem)' }}
              >
                Where tension
              </span>
            </span>

            {/* Line 2: becomes */}
            <span className="hero-line block overflow-hidden pl-4 sm:pl-8 lg:pl-12">
              <span
                className="block font-heading font-bold text-gold-pale leading-[0.92]"
                style={{ fontSize: 'clamp(2.8rem, 2rem + 6.5vw, 9.5rem)' }}
              >
                becomes
              </span>
            </span>

            {/* Line 3: tenderness. (gradient gold) */}
            <span className="hero-line block overflow-hidden pl-8 sm:pl-16 lg:pl-24">
              <span
                className="block font-heading font-bold leading-[0.92]"
                style={{
                  fontSize: 'clamp(2.8rem, 2rem + 6.5vw, 9.5rem)',
                  background: 'linear-gradient(135deg, #F1E194 0%, #D4A843 50%, #5B0E14 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                tenderness.
              </span>
            </span>
          </h1>

          {/* Divider line */}
          <div
            className="hero-divider mb-8"
            style={{
              width: '64px',
              height: '1px',
              background: 'linear-gradient(90deg, rgba(241,225,148,0.4), transparent)',
            }}
          />

          {/* Subtitle */}
          <p
            className="hero-subtitle text-gold-pale/65 max-w-[500px] mb-12 leading-relaxed"
            style={{ fontSize: 'clamp(0.95rem, 0.85rem + 0.5vw, 1.2rem)' }}
          >
            Textiles knotted at the crossroads of tradition and nerve.
            Every thread earns its place.
          </p>

          {/* CTAs */}
          <div className="hero-ctas flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="group relative inline-flex items-center gap-2.5 px-8 py-4 bg-gold text-burgundy-deep font-medium text-sm rounded-full overflow-hidden transition-all duration-300 hover:bg-burgundy hover:text-gold hover:shadow-[0_8px_32px_rgba(241,225,148,0.25)]"
            >
              <span className="relative z-10">Explore Collection</span>
              <svg
                className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-8 py-4 border border-gold-pale/25 text-gold-pale font-medium text-sm rounded-full transition-all duration-300 hover:bg-gold-pale/5 hover:border-gold/40"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll absolute bottom-10 right-8 lg:right-16 flex flex-col items-center gap-3 text-gold-pale/25">
          <span
            className="font-mono text-[10px] tracking-[0.3em] uppercase"
            style={{ writingMode: 'vertical-rl' }}
          >
            Scroll
          </span>
          <div className="w-[1px] h-14 bg-gradient-to-b from-gold/30 to-transparent relative overflow-hidden">
            <div className="hero-scroll-pulse absolute top-0 left-0 w-full h-5 bg-gold/60" />
          </div>
        </div>
      </div>
    </section>
  )
}
