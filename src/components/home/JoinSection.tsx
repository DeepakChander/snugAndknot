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
      addToast('Welcome to the Snug&Knot family!')
      setEmail('')
    }
  }

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      const inner = sectionRef.current!.querySelector('.join-inner')
      if (inner) {
        gsap.fromTo(inner,
          { opacity: 0, y: 50, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 75%',
            },
          }
        )
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="relative py-20 lg:py-28 bg-cream">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="join-inner relative rounded-3xl overflow-hidden bg-charcoal p-12 lg:p-20">
          {/* Background texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, #fff 0.5px, transparent 0.5px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Ambient glows */}
          <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-terracotta/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[150px] bg-blush/8 blur-[80px] rounded-full" />

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <p className="font-mono text-xs text-terracotta tracking-[0.35em] uppercase mb-6">
              Join the Family
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-cream mb-4 leading-[1.1]">
              Stay in the Loop
            </h2>
            <p className="text-cream/75 text-sm leading-relaxed mb-10 max-w-md mx-auto">
              Be the first to know about new arrivals, exclusive offers,
              and styling inspiration delivered straight to your inbox.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-6 py-3.5 bg-cream/5 border border-cream/20 rounded-full text-sm text-cream placeholder:text-cream/50 focus:outline-none focus:border-terracotta/50 transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-3.5 bg-cream text-charcoal text-sm font-medium rounded-full hover:bg-terracotta hover:text-cream transition-colors duration-500 shrink-0"
              >
                Subscribe
              </button>
            </form>

            <p className="text-[11px] text-cream/50 mt-5 tracking-wider">
              No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
