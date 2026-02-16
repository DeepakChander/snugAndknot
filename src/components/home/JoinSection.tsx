'use client'

import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { useUIStore } from '@/stores/ui-store'

gsap.registerPlugin(ScrollTrigger)

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

    const ctx = gsap.context(() => {
      const inner = sectionRef.current!.querySelector('.join-inner')
      const tag = sectionRef.current!.querySelector('.join-tag')
      const heading = sectionRef.current!.querySelector('.join-heading')
      const body = sectionRef.current!.querySelector('.join-body')
      const form = sectionRef.current!.querySelector('.join-form')
      const disclaimer = sectionRef.current!.querySelector('.join-disclaimer')

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
          {/* Background dot texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'radial-gradient(circle, #F1E194 0.5px, transparent 0.5px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Ambient glows */}
          <div
            className="absolute top-0 left-1/4 w-[400px] h-[200px] blur-[100px] rounded-full"
            style={{ backgroundColor: 'rgba(91, 14, 20, 0.10)' }}
          />
          <div
            className="absolute bottom-0 right-1/4 w-[300px] h-[150px] blur-[80px] rounded-full"
            style={{ backgroundColor: 'rgba(241, 225, 148, 0.08)' }}
          />

          {/* Content */}
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

            {/* Social proof — avatar stack */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="flex -space-x-2">
                {['SM', 'JC', 'ER', 'DP', '+'].map((initials, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-noir flex items-center justify-center text-[9px] font-medium"
                    style={{
                      backgroundColor: i === 4 ? 'rgba(212,168,67,0.3)' : 'rgba(91,14,20,0.8)',
                      color: 'rgba(241,225,148,0.7)',
                    }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-xs" style={{ color: 'rgba(250, 240, 200, 0.50)' }}>
                Join 35,000+ members
              </p>
            </div>

            <p
              className="join-body text-sm leading-relaxed mb-10 max-w-md mx-auto"
              style={{ color: 'rgba(250, 240, 200, 0.70)' }}
            >
              First dispatches. Process stories. Threads we are following.
              No noise. No apologies. Just the weave, continuing.
            </p>

            <form
              onSubmit={handleSubmit}
              className="join-form group/form flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your thread starts here"
                required
                className="flex-1 px-6 py-3.5 bg-transparent rounded-full text-sm transition-colors placeholder:text-gold-pale/40 text-gold-pale focus:outline-none focus:ring-1 focus:ring-gold/50"
                style={{
                  border: '1px solid rgba(241, 225, 148, 0.20)',
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
