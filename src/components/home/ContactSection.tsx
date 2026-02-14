'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

/* ── Decorative animated line with endpoint dots ── */
function AnimatedLine({ id }: { id: string }) {
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lineRef.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: lineRef.current,
          start: 'top 85%',
        },
      })

      // Line draws from center outward
      tl.fromTo(
        `#${id}-line-left`,
        { scaleX: 0, transformOrigin: 'right center' },
        { scaleX: 1, duration: 1.2, ease: 'expo.out' },
        0
      )
      tl.fromTo(
        `#${id}-line-right`,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 1.2, ease: 'expo.out' },
        0
      )

      // Dots fade in
      tl.fromTo(
        `#${id}-dot-left`,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' },
        0.3
      )
      tl.fromTo(
        `#${id}-dot-center`,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' },
        0.1
      )
      tl.fromTo(
        `#${id}-dot-right`,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' },
        0.3
      )
    }, lineRef)

    return () => ctx.revert()
  }, [id])

  return (
    <div ref={lineRef} className="relative flex items-center max-w-3xl mx-auto h-[2px]">
      {/* Left dot */}
      <div
        id={`${id}-dot-left`}
        className="absolute left-0 w-[6px] h-[6px] rounded-full bg-terracotta/40 -translate-x-1/2"
      />
      {/* Left line half */}
      <div
        id={`${id}-line-left`}
        className="absolute left-0 right-1/2 h-[1px] bg-gradient-to-l from-terracotta/30 to-transparent"
      />
      {/* Center dot */}
      <div
        id={`${id}-dot-center`}
        className="absolute left-1/2 w-[8px] h-[8px] rounded-full border border-terracotta/40 -translate-x-1/2"
      />
      {/* Right line half */}
      <div
        id={`${id}-line-right`}
        className="absolute left-1/2 right-0 h-[1px] bg-gradient-to-r from-terracotta/30 to-transparent"
      />
      {/* Right dot */}
      <div
        id={`${id}-dot-right`}
        className="absolute right-0 w-[6px] h-[6px] rounded-full bg-terracotta/40 translate-x-1/2"
      />
    </div>
  )
}

/* ── Email button with triple-layer rolling text + rotating arrow ── */
function EmailButton() {
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (!buttonRef.current) return

    const ctx = gsap.context(() => {
      gsap.from(buttonRef.current!, {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: buttonRef.current,
          start: 'top 85%',
        },
      })
    }, buttonRef)

    return () => ctx.revert()
  }, [])

  return (
    <a
      ref={buttonRef}
      href="mailto:hello@snugandknot.com"
      className="group relative inline-flex items-center gap-5 w-full max-w-md mx-auto justify-center py-5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Rotating arrow — exact same as Framer reference (225deg default, rotates on hover) */}
      <div
        className="relative w-5 h-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: isHovered ? 'rotate(180deg)' : 'rotate(225deg)',
        }}
      >
        <div className="absolute inset-0 border-t-[1.5px] border-r-[1.5px] border-walnut" />
      </div>

      {/* Triple-layer rolling text — exact same structure as Framer */}
      <div className="relative overflow-hidden h-[32px] flex-1">
        {/* Text layer 1 (top — hidden, slides into view on hover exit) */}
        <div
          className="absolute inset-0 flex items-center justify-center font-mono text-lg sm:text-xl tracking-[0.15em] text-walnut transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: isHovered ? 0 : 0,
            transform: isHovered ? 'translateY(0%)' : 'translateY(-100%)',
          }}
        >
          HELLO@SNUGANDKNOT.COM
        </div>

        {/* Text layer 2 (middle — visible by default, slides up on hover) */}
        <div
          className="absolute inset-0 flex items-center justify-center font-mono text-lg sm:text-xl tracking-[0.15em] text-walnut transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: 1,
            transform: isHovered ? 'translateY(-100%)' : 'translateY(0%)',
          }}
        >
          HELLO@SNUGANDKNOT.COM
        </div>

        {/* Text layer 3 (bottom — hidden, rolls into view on hover) */}
        <div
          className="absolute inset-0 flex items-center justify-center font-mono text-lg sm:text-xl tracking-[0.15em] text-terracotta transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0%)' : 'translateY(100%)',
          }}
        >
          HELLO@SNUGANDKNOT.COM
        </div>
      </div>
    </a>
  )
}

export default function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      // Heading fade in
      if (headingRef.current) {
        gsap.from(headingRef.current, {
          opacity: 0,
          y: 40,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 80%',
          },
        })
      }

      // Description fade in
      if (descRef.current) {
        gsap.from(descRef.current, {
          opacity: 0,
          y: 20,
          duration: 1,
          delay: 0.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: descRef.current,
            start: 'top 85%',
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="relative py-32 lg:py-44 bg-cream-dark overflow-hidden"
    >
      {/* ── SVG Ambient Glow (exact same as Framer — rotated 180deg container) ── */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ transform: 'rotate(180deg)' }}
      >
        <svg
          width="100%"
          height="40%"
          aria-hidden="true"
          className="absolute top-0 left-0"
          style={{
            filter: 'blur(54px) brightness(1)',
          }}
        >
          <defs>
            <radialGradient id="contact-glow" cx="50%" cy="0%" r="1">
              <stop offset="0%" stopColor="rgb(196, 121, 90)" stopOpacity="1" />
              <stop offset="80%" stopColor="rgb(196, 121, 90)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="contact-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0000" />
              <stop offset="100%" stopColor="#000" stopOpacity="1" />
            </linearGradient>
            <radialGradient id="contact-edgeGlow" cx="50%" cy="100%" r="1">
              <stop offset="0%" stopColor="rgb(196, 121, 90)" stopOpacity="0.7" />
              <stop offset="60%" stopColor="rgb(196, 121, 90)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="44%" cy="-31%" rx="440" ry="220" fill="url(#contact-glow)" opacity="0.42" />
          <ellipse cx="-6%" cy="47%" rx="340" ry="170" fill="url(#contact-glow)" opacity="0.03" />
          <ellipse cx="32%" cy="-20%" rx="250" ry="125" fill="url(#contact-glow)" opacity="0.24" />
          <ellipse cx="85%" cy="40%" rx="400" ry="200" fill="url(#contact-glow)" opacity="0.93" />
          <ellipse cx="50%" cy="100%" rx="480" ry="100" fill="url(#contact-edgeGlow)" />
          <rect x="0" y="0" width="100%" height="100%" fill="url(#contact-fade)" />
        </svg>

        {/* Grain texture overlay — exact same as Framer */}
        <div
          className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: '2.5px 2.5px',
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ── Heading ── */}
        <div ref={headingRef} className="text-center mb-6">
          <h2
            className="text-charcoal tracking-[0.15em]"
            style={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '33px',
              fontWeight: 500,
              lineHeight: '1em',
            }}
          >
            LET&apos;S CONNECT
          </h2>
        </div>

        {/* ── Top decorative animated line ── */}
        <div className="my-12">
          <AnimatedLine id="line-top" />
        </div>

        {/* ── Description text ── */}
        <div ref={descRef} className="max-w-xl mx-auto text-center mb-10">
          <p className="text-sm text-walnut leading-relaxed">
            Every collection begins with a vision. Whether you&apos;re looking for the perfect
            piece to complete your wardrobe or have questions about our handcrafted garments,
            we&apos;d love to hear from you.
          </p>
        </div>

        {/* ── Email button with triple-layer rolling text ── */}
        <div className="mb-10">
          <EmailButton />
        </div>

        {/* ── Bottom decorative animated line ── */}
        <div className="my-12">
          <AnimatedLine id="line-bottom" />
        </div>

        {/* ── Copyright footer ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto mt-8">
          <div className="text-xs text-walnut/80 tracking-[0.1em]">
            <p>COPYRIGHT</p>
            <p>&copy; SNUGANDKNOT.COM 2026</p>
          </div>
          <div className="text-xs text-walnut/80 tracking-[0.1em] text-center">
            ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
    </section>
  )
}
