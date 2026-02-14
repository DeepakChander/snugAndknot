'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

const testimonials = [
  {
    quote: 'The quality of the cashmere blend is unlike anything I\'ve owned. Every piece feels like it was made just for me.',
    name: 'Sarah Mitchell',
    role: 'Creative Director',
    initials: 'SM',
  },
  {
    quote: 'Snug&Knot has completely redefined what I expect from everyday clothing. The attention to detail is extraordinary.',
    name: 'James Chen',
    role: 'Architect',
    initials: 'JC',
  },
  {
    quote: 'I\'ve been wearing the merino wool collection for two seasons now and they look as beautiful as day one.',
    name: 'Elena Rodriguez',
    role: 'Art Curator',
    initials: 'ER',
  },
  {
    quote: 'Finally, a brand that understands the balance between comfort and elegance. My go-to for everything.',
    name: 'David Park',
    role: 'Photographer',
    initials: 'DP',
  },
]

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const quoteRef = useRef<HTMLDivElement>(null)
  const authorRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const animateTransition = useCallback((nextIndex: number) => {
    if (isAnimating || !quoteRef.current || !authorRef.current) return
    setIsAnimating(true)

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrent(nextIndex)
        setIsAnimating(false)
      },
    })

    // Fade out current
    tl.to(quoteRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: 'power2.in',
    }, 0)
    tl.to(authorRef.current, {
      opacity: 0,
      y: -10,
      duration: 0.3,
      ease: 'power2.in',
    }, 0.1)

    // Update content
    tl.call(() => setCurrent(nextIndex), [], 0.5)

    // Fade in new
    tl.fromTo(quoteRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' },
      0.55
    )
    tl.fromTo(authorRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' },
      0.65
    )
  }, [isAnimating])

  const goNext = useCallback(() => {
    animateTransition((current + 1) % testimonials.length)
  }, [current, animateTransition])

  const goPrev = useCallback(() => {
    animateTransition((current - 1 + testimonials.length) % testimonials.length)
  }, [current, animateTransition])

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(goNext, 6000)
    return () => clearInterval(timer)
  }, [goNext])

  // Entrance animation
  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(sectionRef.current!.querySelector('.testimonial-inner'),
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="relative py-28 lg:py-40 bg-cream-dark overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-beige to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-beige to-transparent" />

      {/* Large decorative quotes */}
      <div className="absolute top-12 left-8 lg:left-16 text-[12rem] lg:text-[16rem] font-heading text-charcoal/[0.02] leading-none select-none pointer-events-none">
        &ldquo;
      </div>

      <div className="testimonial-inner max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section tag */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-terracotta tracking-[0.3em] uppercase">
            What People Say
          </p>
        </div>

        {/* Quote area */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div ref={quoteRef}>
            <blockquote className="font-heading text-2xl sm:text-3xl lg:text-4xl text-charcoal leading-[1.3] mb-8">
              &ldquo;{testimonials[current].quote}&rdquo;
            </blockquote>
          </div>

          <div ref={authorRef} className="flex items-center justify-center gap-4">
            <div className="w-10 h-10 rounded-full bg-charcoal flex items-center justify-center">
              <span className="text-cream text-xs font-medium">
                {testimonials[current].initials}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-charcoal">
                {testimonials[current].name}
              </p>
              <p className="text-xs text-walnut">
                {testimonials[current].role}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-8">
          {/* Prev arrow */}
          <button
            onClick={goPrev}
            disabled={isAnimating}
            className="group w-10 h-10 rounded-full border border-charcoal/10 flex items-center justify-center hover:border-charcoal/30 hover:bg-charcoal/5 transition-all disabled:opacity-40"
            aria-label="Previous testimonial"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-charcoal/60 group-hover:text-charcoal transition-colors rotate-180">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => !isAnimating && animateTransition(i)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === current ? 'w-8 bg-terracotta' : 'w-2 bg-charcoal/15 hover:bg-charcoal/25'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          {/* Next arrow */}
          <button
            onClick={goNext}
            disabled={isAnimating}
            className="group w-10 h-10 rounded-full border border-charcoal/10 flex items-center justify-center hover:border-charcoal/30 hover:bg-charcoal/5 transition-all disabled:opacity-40"
            aria-label="Next testimonial"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-charcoal/60 group-hover:text-charcoal transition-colors">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Counter */}
        <div className="text-center mt-8">
          <span className="font-mono text-xs text-walnut/70">
            {String(current + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </section>
  )
}
