'use client'

import { useRef, useEffect, useCallback, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

/* ─── Particle config ──────────────────────────────────────── */
interface Particle {
  id: number
  x: number      // starting % from left
  y: number      // starting % from top
  size: number   // 2-6px
  opacity: number // 0.10 - 0.30
  driftX: number  // horizontal drift magnitude
  driftY: number  // vertical drift magnitude (negative = upward)
  duration: number // float cycle duration
  delay: number   // animation delay
}

function generateParticles(count: number): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      opacity: 0.10 + Math.random() * 0.20,
      driftX: (Math.random() - 0.5) * 60,
      driftY: -(20 + Math.random() * 40),
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 5,
    })
  }
  return particles
}

/* ─── SVG Knot paths ──────────────────────────────────────── */
// Elegant Celtic-inspired knot drawn with gold strokes
const KNOT_PATHS = [
  // Outer ring
  'M 150 50 C 230 50, 300 100, 300 150 C 300 230, 230 300, 150 300 C 70 300, 0 230, 0 150 C 0 70, 70 50, 150 50 Z',
  // Inner figure-8 crossover top-left to bottom-right
  'M 75 75 C 120 60, 180 120, 150 150 C 120 180, 60 180, 75 225 C 90 270, 180 270, 225 225',
  // Inner figure-8 crossover top-right to bottom-left
  'M 225 75 C 180 60, 120 120, 150 150 C 180 180, 240 180, 225 225 C 210 270, 120 270, 75 225',
  // Decorative inner loop left
  'M 100 120 C 80 100, 60 130, 80 150 C 100 170, 130 160, 120 140 C 110 120, 90 110, 100 120',
  // Decorative inner loop right
  'M 200 120 C 220 100, 240 130, 220 150 C 200 170, 170 160, 180 140 C 190 120, 210 110, 200 120',
  // Decorative inner loop bottom
  'M 150 200 C 130 220, 140 250, 160 240 C 180 230, 180 210, 170 200 C 160 190, 140 190, 150 200',
  // Central diamond
  'M 150 110 L 190 150 L 150 190 L 110 150 Z',
  // Weaving strand 1
  'M 50 100 C 100 80, 130 130, 150 100 C 170 70, 200 80, 250 100',
  // Weaving strand 2
  'M 50 200 C 100 220, 130 170, 150 200 C 170 230, 200 220, 250 200',
  // Top decorative arc
  'M 100 30 C 130 10, 170 10, 200 30',
  // Bottom decorative arc
  'M 100 270 C 130 290, 170 290, 200 270',
  // Left decorative arc
  'M 30 100 C 10 130, 10 170, 30 200',
  // Right decorative arc
  'M 270 100 C 290 130, 290 170, 270 200',
]

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const tagRef = useRef<HTMLSpanElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const particlesContainerRef = useRef<HTMLDivElement>(null)
  const knotRef = useRef<SVGSVGElement>(null)
  const contentWrapRef = useRef<HTMLDivElement>(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const rafId = useRef<number>(0)
  const reducedMotion = useReducedMotion()

  const particles = useMemo(() => generateParticles(8), [])

  /* ─── Ambient animations (gradient, particles, knot breathing) ── */
  useEffect(() => {
    if (reducedMotion) return

    const ctx = gsap.context(() => {
      // Animated gradient background
      if (bgRef.current) {
        const gradPos = { x1: 30, y1: 50, x2: 80, y2: 70 }
        gsap.to(gradPos, {
          x1: 50, y1: 30, x2: 60, y2: 80,
          duration: 8,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          onUpdate: () => {
            if (bgRef.current) {
              bgRef.current.style.background = `
                radial-gradient(ellipse at ${gradPos.x1}% ${gradPos.y1}%, #3D0A0E 0%, transparent 50%),
                radial-gradient(ellipse at ${gradPos.x2}% ${gradPos.y2}%, #5B0E14 0%, transparent 40%),
                radial-gradient(ellipse at 50% 50%, #1A0E10 0%, #0F0A0B 100%)
              `
            }
          },
        })
      }

      // Floating particles
      const particleEls = particlesContainerRef.current?.querySelectorAll('.hero-particle')
      if (particleEls?.length) {
        particleEls.forEach((el, i) => {
          const p = particles[i]
          if (!p) return
          gsap.to(el, {
            y: p.driftY, x: p.driftX,
            duration: p.duration, ease: 'sine.inOut',
            repeat: -1, yoyo: true, delay: p.delay,
          })
          gsap.to(el, {
            opacity: p.opacity * 1.8,
            duration: p.duration * 0.6, ease: 'sine.inOut',
            repeat: -1, yoyo: true, delay: p.delay + 1,
          })
        })
      }

      // SVG knot breathing
      if (knotRef.current) {
        gsap.to(knotRef.current, {
          rotation: 3.5, scale: 1.03,
          duration: 8, ease: 'sine.inOut',
          repeat: -1, yoyo: true,
          transformOrigin: 'center center',
        })
      }
    })

    return () => ctx.revert()
  }, [reducedMotion, particles])

  /* ─── Entrance choreography ─────────────────────────── */
  useEffect(() => {
    if (reducedMotion || !headingRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 })

      /* Step 1 (0ms): Background gradient fades from black */
      tl.fromTo(
        bgRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.6, ease: 'power2.inOut' },
        0
      )

      /* Step 2 (200ms): Gold particles float in from edges */
      const particleEls = particlesContainerRef.current?.querySelectorAll('.hero-particle')
      if (particleEls) {
        tl.fromTo(
          particleEls,
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: (i: number) => particles[i]?.opacity ?? 0.15,
            duration: 1.4,
            stagger: { each: 0.06, from: 'random' },
            ease: 'back.out(2)',
          },
          0.2
        )
      }

      /* Step 3 (400ms): Season tag slides in from left with blur */
      tl.fromTo(
        tagRef.current,
        { x: -160, opacity: 0, filter: 'blur(16px)' },
        { x: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' },
        0.4
      )

      /* Step 4 (600ms): Headline lines rotate in dramatically */
      const lines = headingRef.current?.querySelectorAll('.hero-line')
      if (lines) {
        tl.fromTo(
          lines,
          {
            rotateX: 110,
            opacity: 0,
            y: 60,
            scale: 0.9,
            transformOrigin: 'center bottom',
          },
          {
            rotateX: 0,
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.6,
            stagger: 0.14,
            ease: 'expo.out',
          },
          0.6
        )
      }

      /* Step 5 (1000ms): SVG knot paths draw in */
      const knotPaths = knotRef.current?.querySelectorAll('.knot-path')
      if (knotPaths) {
        knotPaths.forEach((path) => {
          const svgPath = path as SVGPathElement
          const length = svgPath.getTotalLength()
          gsap.set(svgPath, {
            strokeDasharray: length,
            strokeDashoffset: length,
          })
        })

        tl.to(
          knotPaths,
          {
            strokeDashoffset: 0,
            duration: 2.5,
            stagger: 0.12,
            ease: 'power2.inOut',
          },
          1.0
        )

        // Fade knot container in
        tl.fromTo(
          knotRef.current,
          { opacity: 0 },
          { opacity: 0.17, duration: 1.2, ease: 'power2.out' },
          1.0
        )
      }

      /* Step 6 (1200ms): Subtitle and CTAs stagger in */
      tl.fromTo(
        subtitleRef.current,
        { y: 50, opacity: 0, filter: 'blur(10px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' },
        1.2
      )

      const buttons = ctaRef.current?.querySelectorAll('.hero-cta')
      if (buttons) {
        tl.fromTo(
          buttons,
          { y: 80, opacity: 0, scale: 0.85 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.4,
            stagger: 0.12,
            ease: 'back.out(1.6)',
          },
          1.3
        )
      }

      /* Step 7 (1500ms): Scroll indicator fades in */
      tl.fromTo(
        scrollIndicatorRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' },
        1.5
      )

      // Scroll indicator pulse animation (replaces style jsx)
      const scrollPulseEl = scrollIndicatorRef.current?.querySelector('.scroll-pulse')
      if (scrollPulseEl) {
        gsap.to(scrollPulseEl, {
          y: '250%',
          duration: 2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 2.5,
        })
      }
    })

    return () => ctx.revert()
  }, [reducedMotion, particles])

  /* ─── Scroll parallax + mouse interaction ──────────── */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (reducedMotion) return
      const rect = e.currentTarget.getBoundingClientRect()
      mousePos.current = {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: ((e.clientY - rect.top) / rect.height) * 2 - 1,
      }
    },
    [reducedMotion]
  )

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      // Text parallax
      if (contentWrapRef.current) {
        gsap.to(contentWrapRef.current, {
          y: -120, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 0.5 },
        })
      }

      // Particles parallax
      const particleEls = particlesContainerRef.current?.querySelectorAll('.hero-particle')
      if (particleEls) {
        particleEls.forEach((el, i) => {
          gsap.to(el, {
            y: `-=${50 + (i % 4) * 40}`, ease: 'none',
            scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 0.8 },
          })
        })
      }

      // SVG knot scroll rotation
      if (knotRef.current) {
        gsap.to(knotRef.current, {
          rotation: 15, ease: 'none',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
        })
      }
    })

    // Mouse interaction (desktop RAF loop)
    let active = true
    const animate = () => {
      if (!active) return
      const { x, y } = mousePos.current

      const pEls = particlesContainerRef.current?.querySelectorAll('.hero-particle')
      if (pEls) {
        pEls.forEach((el, i) => {
          const factor = 3 + (i % 5) * 2
          gsap.to(el as HTMLElement, {
            xPercent: -x * factor, yPercent: -y * factor,
            duration: 1.5, ease: 'power2.out', overwrite: 'auto',
          })
        })
      }

      if (knotRef.current) {
        gsap.to(knotRef.current, {
          rotateY: x * 3, rotateX: -y * 3,
          duration: 1.2, ease: 'power2.out', overwrite: 'auto',
        })
      }

      rafId.current = requestAnimationFrame(animate)
    }
    rafId.current = requestAnimationFrame(animate)

    return () => {
      active = false
      cancelAnimationFrame(rafId.current)
      ctx.revert()
    }
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden bg-noir"
    >
      {/* ── Animated gradient background ────────────────── */}
      <div
        ref={bgRef}
        className="absolute inset-0 z-0"
        style={{
          opacity: 0,
          background: `
            radial-gradient(ellipse at 30% 50%, #3D0A0E 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, #5B0E14 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, #1A0E10 0%, #0F0A0B 100%)
          `,
        }}
      />

      {/* ── Ambient texture overlay ─────────────────────── */}
      <div
        className="absolute inset-0 z-[1] opacity-[0.04] mix-blend-luminosity pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(241,225,148,0.12) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(91,14,20,0.18) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(250,240,200,0.06) 0%, transparent 70%)
          `,
        }}
      />

      {/* ── Subtle knit pattern overlay ─────────────────── */}
      <div className="absolute inset-0 z-[1] knit-pattern-gold pointer-events-none" />

      {/* ── Floating gold particles ─────────────────────── */}
      <div
        ref={particlesContainerRef}
        className="absolute inset-0 z-[2] pointer-events-none overflow-hidden"
      >
        {particles.map((p) => (
          <div
            key={p.id}
            className="hero-particle absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: '#F1E194',
              opacity: 0,
              boxShadow: `0 0 ${p.size * 2}px ${p.size}px rgba(241,225,148,0.15)`,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>

      {/* ── Decorative SVG knot (right side) ────────────── */}
      <div
        className="absolute top-1/2 right-0 z-[2] pointer-events-none hidden lg:block"
        style={{
          transform: 'translateY(-50%)',
          width: '40%',
          maxWidth: '600px',
        }}
      >
        <svg
          ref={knotRef}
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          style={{
            opacity: 0,
            perspective: '800px',
            willChange: 'transform, opacity',
          }}
        >
          {KNOT_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              className="knot-path"
              stroke="#F1E194"
              strokeWidth={i === 0 ? 1.5 : i === 6 ? 0.8 : 1}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              style={{ willChange: 'stroke-dashoffset' }}
            />
          ))}
        </svg>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div
        ref={contentWrapRef}
        className="relative z-[3] flex flex-col justify-center min-h-screen px-6 sm:px-10 lg:px-16 py-20"
      >
        <div className="max-w-[900px]">
          {/* Season tag */}
          <span
            ref={tagRef}
            className="inline-block mb-8 px-4 py-1.5 rounded-full border border-gold/20 bg-gold/[0.06] text-gold font-mono text-[11px] tracking-[0.5em] uppercase opacity-0"
          >
            The First Fold
          </span>

          {/* Staircase headline */}
          <h1 ref={headingRef} className="mb-8" style={{ perspective: '1200px' }}>
            <span className="hero-line block overflow-hidden opacity-0">
              <span
                className="block font-heading font-bold text-gold-pale leading-[0.95]"
                style={{ fontSize: 'clamp(2.5rem, 2rem + 6vw, 9rem)' }}
              >
                Where tension
              </span>
            </span>
            <span className="hero-line block overflow-hidden opacity-0 pl-6 sm:pl-10">
              <span
                className="block font-heading font-bold text-gold-pale leading-[0.95]"
                style={{ fontSize: 'clamp(2.5rem, 2rem + 6vw, 9rem)' }}
              >
                becomes
              </span>
            </span>
            <span className="hero-line block overflow-hidden opacity-0 pl-12 sm:pl-20">
              <span
                className="block font-heading font-bold leading-[0.95]"
                style={{
                  fontSize: 'clamp(2.5rem, 2rem + 6vw, 9rem)',
                  background:
                    'linear-gradient(135deg, #F1E194 0%, #D4A843 50%, #5B0E14 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                tenderness.
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            className="text-gold-pale/70 max-w-[520px] mb-12 opacity-0"
            style={{ fontSize: 'clamp(1rem, 0.9rem + 0.5vw, 1.25rem)' }}
          >
            Textiles knotted at the crossroads of tradition and nerve. Every
            thread earns its place.
          </p>

          {/* CTAs */}
          <div ref={ctaRef} className="flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="hero-cta group relative inline-flex items-center gap-2 px-8 py-4 bg-gold text-burgundy-deep font-medium text-sm rounded-full overflow-hidden transition-all duration-300 hover:bg-burgundy hover:text-gold hover:shadow-[0_8px_32px_rgba(241,225,148,0.3)] opacity-0"
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
              className="hero-cta inline-flex items-center gap-2 px-8 py-4 border border-gold-pale/30 text-gold-pale font-medium text-sm rounded-full transition-all duration-300 hover:bg-gold-pale/5 hover:border-gold opacity-0"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          ref={scrollIndicatorRef}
          className="absolute bottom-10 right-8 lg:right-16 flex flex-col items-center gap-3 text-gold-pale/30"
          style={{ opacity: 0 }}
        >
          <span
            className="font-mono text-[10px] tracking-[0.3em] uppercase"
            style={{ writingMode: 'vertical-rl' }}
          >
            Scroll
          </span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-gold/40 to-transparent relative overflow-hidden">
            <div
              className="scroll-pulse absolute top-0 left-0 w-full h-6 bg-gold/80"
              style={{ transform: 'translateY(-100%)' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
