'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

const testimonials = [
  {
    quote: 'I stopped noticing it. That is when I knew.',
    name: 'Sarah Mitchell',
    role: 'Third order',
    initials: 'SM',
  },
  {
    quote: 'My architect brain cannot find a single unnecessary stitch. Everything is load-bearing.',
    name: 'James Chen',
    role: 'Second order',
    initials: 'JC',
  },
  {
    quote: 'Two seasons in. The wool remembers my shoulders better than I remember buying it.',
    name: 'Elena Rodriguez',
    role: 'Fifth order',
    initials: 'ER',
  },
  {
    quote: 'I thought I was buying a sweater. I was buying the last sweater.',
    name: 'David Park',
    role: 'Fourth order',
    initials: 'DP',
  },
]

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const quoteRef = useRef<HTMLDivElement>(null)
  const prevQuoteRef = useRef<HTMLDivElement>(null)
  const authorRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const progressTween = useRef<gsap.core.Tween | null>(null)
  const reducedMotion = useReducedMotion()

  const prevIndex = (current - 1 + testimonials.length) % testimonials.length

  // Reset and restart the 6s gold progress bar
  const startProgressBar = useCallback(() => {
    if (!progressBarRef.current) return
    if (progressTween.current) progressTween.current.kill()

    gsap.set(progressBarRef.current, { scaleX: 0 })
    progressTween.current = gsap.to(progressBarRef.current, {
      scaleX: 1,
      duration: 6,
      ease: 'none',
    })
  }, [])

  const animateTransition = useCallback((nextIndex: number) => {
    if (isAnimating || !quoteRef.current || !authorRef.current) return
    setIsAnimating(true)

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrent(nextIndex)
        setIsAnimating(false)
        startProgressBar()
      },
    })

    // Fade out current quote
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

    // Also fade the previous-quote ghost out briefly
    if (prevQuoteRef.current) {
      tl.to(prevQuoteRef.current, {
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
      }, 0)
    }

    // Update content
    tl.call(() => setCurrent(nextIndex), [], 0.5)

    // Fade in new quote
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

    // Fade the previous-quote ghost back in
    if (prevQuoteRef.current) {
      tl.fromTo(prevQuoteRef.current,
        { opacity: 0 },
        { opacity: 0.3, duration: 0.5, ease: 'power2.out' },
        0.6
      )
    }
  }, [isAnimating, startProgressBar])

  const goNext = useCallback(() => {
    animateTransition((current + 1) % testimonials.length)
  }, [current, animateTransition])

  const goPrev = useCallback(() => {
    animateTransition((current - 1 + testimonials.length) % testimonials.length)
  }, [current, animateTransition])

  // Auto-advance every 6s
  useEffect(() => {
    const timer = setInterval(goNext, 6000)
    return () => clearInterval(timer)
  }, [goNext])

  // Start the progress bar on mount and whenever current changes
  useEffect(() => {
    startProgressBar()
  }, [current, startProgressBar])

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
    <section ref={sectionRef} className="relative py-28 lg:py-40 bg-parchment overflow-hidden">
      {/* Top / bottom gold borders */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {/* Large decorative quote mark -- burgundy at 3% opacity */}
      <div className="absolute top-12 left-8 lg:left-16 text-[12rem] lg:text-[16rem] font-heading text-burgundy/[0.03] leading-none select-none pointer-events-none">
        &ldquo;
      </div>

      <div className="testimonial-inner max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section tag -- gold text */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-gold tracking-[0.3em] uppercase">
            Worn In
          </p>
        </div>

        {/* Center reading frame */}
        <div className="max-w-[640px] mx-auto border-t border-b border-gold/20 py-12 mb-16">
          {/* Current quote */}
          <div
            className="text-center"
            role="region"
            aria-label="Customer testimonials"
            aria-live="polite"
            aria-atomic="true"
          >
            <div ref={quoteRef}>
              <blockquote className="font-heading text-2xl sm:text-3xl lg:text-4xl text-burgundy leading-[1.3] mb-8">
                &ldquo;{testimonials[current].quote}&rdquo;
              </blockquote>
            </div>

            {/* Author */}
            <div ref={authorRef} className="flex items-center justify-center gap-4">
              <div className="w-10 h-10 rounded-full bg-burgundy flex items-center justify-center">
                <span className="text-gold-pale text-xs font-medium">
                  {testimonials[current].initials}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-burgundy">
                  {testimonials[current].name}
                </p>
                <p className="text-xs text-rosewood">
                  {testimonials[current].role}
                </p>
              </div>
            </div>
          </div>

          {/* Previous quote ghost -- 30% opacity, 95% scale */}
          <div
            ref={prevQuoteRef}
            className="mt-10 text-center pointer-events-none select-none"
            style={{ opacity: 0.3, transform: 'scale(0.95)' }}
            aria-hidden="true"
          >
            <p className="font-heading text-lg sm:text-xl text-burgundy/60 leading-[1.3]">
              &ldquo;{testimonials[prevIndex].quote}&rdquo;
            </p>
          </div>
        </div>

        {/* Gold progress bar (auto-advance indicator) */}
        <div className="max-w-[640px] mx-auto mb-8">
          <div className="h-[2px] bg-burgundy/10 rounded-full overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full bg-gold rounded-full origin-left"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
        </div>

        {/* Navigation -- widely separated arrows */}
        <div className="flex items-center justify-center gap-16">
          {/* Prev arrow -- burgundy, hover gold */}
          <button
            onClick={goPrev}
            disabled={isAnimating}
            className="group w-10 h-10 rounded-full border border-burgundy/15 flex items-center justify-center hover:border-gold/40 hover:bg-gold/5 transition-all disabled:opacity-40"
            aria-label="Previous testimonial"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-burgundy group-hover:text-gold transition-colors rotate-180">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          {/* Progress dots -- active = gold, inactive = burgundy/15 */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => !isAnimating && animateTransition(i)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === current ? 'w-8 bg-gold' : 'w-2 bg-burgundy/15 hover:bg-burgundy/25'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          {/* Next arrow -- burgundy, hover gold */}
          <button
            onClick={goNext}
            disabled={isAnimating}
            className="group w-10 h-10 rounded-full border border-burgundy/15 flex items-center justify-center hover:border-gold/40 hover:bg-gold/5 transition-all disabled:opacity-40"
            aria-label="Next testimonial"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-burgundy group-hover:text-gold transition-colors">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Counter -- rosewood/70 */}
        <div className="text-center mt-8">
          <span className="font-mono text-xs text-rosewood/70">
            {String(current + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </section>
  )
}
