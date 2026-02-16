'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useUIStore } from '@/stores/ui-store'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const knotRef = useRef<SVGSVGElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)
  const setPreloaderDone = useUIStore((s) => s.setPreloaderDone)
  const isPreloaderDone = useUIStore((s) => s.isPreloaderDone)
  const reducedMotion = useReducedMotion()
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Only show on first visit per session
    if (typeof window !== 'undefined') {
      const shown = sessionStorage.getItem('snk-preloader-shown')
      if (shown) {
        setPreloaderDone()
        return
      }
    }

    if (reducedMotion) {
      sessionStorage.setItem('snk-preloader-shown', 'true')
      setPreloaderDone()
      return
    }

    setHasShown(true)

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('snk-preloader-shown', 'true')
        setPreloaderDone()
      },
    })

    // 1. Golden thread knot draws itself (stroke-dashoffset animation)
    if (knotRef.current) {
      const paths = knotRef.current.querySelectorAll('path')
      paths.forEach((path) => {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
      })
      tl.to(
        paths,
        {
          strokeDashoffset: 0,
          duration: 2,
          ease: 'power2.inOut',
          stagger: 0.15,
        },
        0
      )
    }

    // 2. Counter 0-100% in JetBrains Mono style
    const counter = { value: 0 }
    tl.to(
      counter,
      {
        value: 100,
        duration: 2.2,
        ease: 'power1.in',
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = `${Math.round(counter.value)}%`
          }
        },
      },
      0
    )

    // 3. Counter pulses gold at 100%
    tl.to(counterRef.current, {
      color: '#F1E194',
      scale: 1.1,
      duration: 0.3,
      ease: 'back.out(2)',
    })

    // 4. Tagline fades in
    tl.fromTo(
      taglineRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' },
      '-=0.2'
    )

    // 5. Exit: noise dissolve via clip-path
    tl.to(containerRef.current, {
      clipPath: 'circle(0% at 50% 50%)',
      duration: 0.6,
      ease: 'expo.in',
      delay: 0.4,
    })

    return () => {
      tl.kill()
    }
  }, [setPreloaderDone, reducedMotion])

  if (isPreloaderDone && !hasShown) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-noir"
      style={{
        clipPath: 'circle(150% at 50% 50%)',
      }}
    >
      {/* Subtle knit pattern overlay */}
      <div className="absolute inset-0 knit-pattern-gold" />

      {/* Golden thread knot SVG */}
      <svg
        ref={knotRef}
        viewBox="0 0 200 200"
        className="w-32 h-32 mb-8"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Trefoil knot path — golden thread tying itself */}
        <path
          d="M 100 40 C 130 40 150 60 150 80 C 150 100 130 110 110 110 C 90 110 80 130 80 150 C 80 170 100 180 120 170"
          opacity="0.9"
        />
        <path
          d="M 120 170 C 140 160 150 140 140 120 C 130 100 100 95 80 105 C 60 115 50 140 60 160 C 70 175 90 180 100 170"
          opacity="0.7"
        />
        <path
          d="M 100 170 C 110 160 110 140 100 120 C 90 100 70 90 55 95 C 40 100 35 120 45 140 C 55 155 75 160 90 150"
          opacity="0.5"
        />
        {/* Center crossing knot */}
        <path
          d="M 80 80 Q 100 100 120 80 Q 100 60 80 80 Z"
          strokeWidth="2"
          opacity="0.8"
        />
      </svg>

      {/* Brand wordmark */}
      <div className="mb-6">
        <span className="font-heading text-2xl tracking-wide">
          <span className="text-gold-pale">Snug</span>
          <span className="text-gold">&</span>
          <span className="text-gold-pale">Knot</span>
        </span>
      </div>

      {/* Counter */}
      <span
        ref={counterRef}
        className="font-mono text-sm tracking-[0.3em]"
        style={{ color: 'rgba(250, 240, 200, 0.4)' }}
      >
        0%
      </span>

      {/* Tagline */}
      <p
        ref={taglineRef}
        className="font-mono text-[10px] tracking-[0.4em] uppercase mt-6 opacity-0"
        style={{ color: 'rgba(241, 225, 148, 0.3)' }}
      >
        Where tension becomes tenderness
      </p>
    </div>
  )
}
