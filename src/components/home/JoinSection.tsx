'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { useUIStore } from '@/stores/ui-store'

gsap.registerPlugin(ScrollTrigger)

/**
 * Decorative SVG knot shape used as a background watermark.
 * Renders an interlocking loop motif at low opacity.
 */
function DecorativeKnot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer interlocking loops */}
      <path
        d="M100 20C60 20 30 50 30 80C30 110 55 125 80 110C95 100 95 85 85 75C75 65 60 70 55 80C50 90 60 100 70 95"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M100 180C140 180 170 150 170 120C170 90 145 75 120 90C105 100 105 115 115 125C125 135 140 130 145 120C150 110 140 100 130 105"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Cross-over threads */}
      <path
        d="M70 95C80 105 100 120 130 105"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M100 20C100 60 100 140 100 180"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="4 8"
        fill="none"
      />
      {/* Smaller accent loops */}
      <path
        d="M40 140C50 160 80 170 100 155C120 140 110 120 95 125C80 130 85 150 100 155"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M160 60C150 40 120 30 100 45C80 60 90 80 105 75C120 70 115 50 100 45"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export default function JoinSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [email, setEmail] = useState('')
  const addToast = useUIStore((s) => s.addToast)
  const reducedMotion = useReducedMotion()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      addToast('You are now part of the tangle. First dispatch incoming.')
      setEmail('')
    }
  }

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    // ── Entrance animation ──
    const ctx = gsap.context(() => {
      const inner = sectionRef.current!.querySelector('.join-inner')
      const tag = sectionRef.current!.querySelector('.join-tag')
      const heading = sectionRef.current!.querySelector('.join-heading')
      const body = sectionRef.current!.querySelector('.join-body')
      const form = sectionRef.current!.querySelector('.join-form')
      const disclaimer = sectionRef.current!.querySelector('.join-disclaimer')
      const knotSvg = sectionRef.current!.querySelector('.join-knot-svg')

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      })

      if (inner) {
        tl.fromTo(
          inner,
          { opacity: 0, y: 40, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: 'expo.out' }
        )
      }

      if (tag) {
        tl.fromTo(
          tag,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.8'
        )
      }

      if (heading) {
        tl.fromTo(
          heading,
          { opacity: 0, y: 20, clipPath: 'inset(100% 0% 0% 0%)' },
          {
            opacity: 1,
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.9,
            ease: 'expo.out',
          },
          '-=0.5'
        )
      }

      if (body) {
        tl.fromTo(
          body,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
          '-=0.5'
        )
      }

      if (form) {
        tl.fromTo(
          form,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
          '-=0.4'
        )
      }

      if (disclaimer) {
        tl.fromTo(
          disclaimer,
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: 'power1.out' },
          '-=0.3'
        )
      }

      // Breathing knot SVG — gentle fade + scale pulse
      if (knotSvg) {
        tl.fromTo(
          knotSvg,
          { opacity: 0, scale: 0.92 },
          { opacity: 0.1, scale: 1, duration: 1.4, ease: 'power1.out' },
          '-=1.0'
        )

        // Continuous subtle breathing animation on the knot
        gsap.to(knotSvg, {
          scale: 1.03,
          duration: 6,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 1.5,
        })
      }
    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 bg-ivory"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="join-inner relative overflow-hidden p-12 lg:p-20 bg-noir"
          style={{
            borderRadius: '0 1.5rem 1.5rem 0',
          }}
        >
          {/* ── Background dot texture ── */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'radial-gradient(circle, #F1E194 0.5px, transparent 0.5px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* ── Ambient glows ── */}
          <div
            className="absolute top-0 left-1/4 w-[400px] h-[200px] blur-[100px] rounded-full"
            style={{ backgroundColor: 'rgba(91, 14, 20, 0.10)' }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-[300px] h-[150px] blur-[80px] rounded-full"
            style={{ backgroundColor: 'rgba(241, 225, 148, 0.08)' }}
          />

          {/* ── Decorative SVG knot — right 40%, breathing ── */}
          <div className="join-knot-svg absolute top-1/2 right-0 w-[40%] h-full -translate-y-1/2 flex items-center justify-center pointer-events-none opacity-0">
            <DecorativeKnot
              className="w-full h-auto max-h-[80%] text-gold"
            />
          </div>

          {/* ── Content ── */}
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <p
              className="join-tag font-mono text-xs tracking-[0.35em] uppercase mb-6"
              style={{ color: 'rgba(241, 225, 148, 0.60)' }}
            >
              The Tangle
            </p>

            <h2
              className="join-heading font-heading text-3xl sm:text-4xl lg:text-5xl mb-4 leading-[1.1] text-gold-pale"
            >
              Every tangle starts with one thread joining another.
            </h2>

            <p
              className="join-body text-sm leading-relaxed mb-10 max-w-md mx-auto"
              style={{ color: 'rgba(250, 240, 200, 0.70)' }}
            >
              First dispatches. Process stories. Threads we are following.
              No noise. No apologies. Just the weave, continuing.
            </p>

            <form
              onSubmit={handleSubmit}
              className="join-form flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your thread starts here"
                required
                className="flex-1 px-6 py-3.5 bg-transparent rounded-full text-sm focus:outline-none transition-colors placeholder:text-gold-pale/40 text-gold-pale"
                style={{
                  border: '1px solid rgba(241, 225, 148, 0.20)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor =
                    'rgba(241, 225, 148, 0.50)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor =
                    'rgba(241, 225, 148, 0.20)'
                }}
              />
              <button
                type="submit"
                className="px-8 py-3.5 text-sm font-medium rounded-full shrink-0 transition-colors duration-500 bg-gold text-burgundy hover:bg-burgundy-light hover:text-gold"
              >
                Tie in
              </button>
            </form>

            <p
              className="join-disclaimer text-[11px] mt-5 tracking-wider"
              style={{ color: 'rgba(250, 240, 200, 0.40)' }}
            >
              The thread doesn&apos;t break when you leave. It waits.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
