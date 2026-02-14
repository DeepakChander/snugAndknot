'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { useUIStore } from '@/stores/ui-store'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

export default function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const logoRef = useRef<SVGSVGElement>(null)
  const setPreloaderDone = useUIStore((s) => s.setPreloaderDone)
  const isPreloaderDone = useUIStore((s) => s.isPreloaderDone)
  const reducedMotion = useReducedMotion()
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    // Only show on first visit
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

    // Counter animation
    const counter = { value: 0 }
    tl.to(counter, {
      value: 100,
      duration: 2,
      ease: 'power1.in',
      onUpdate: () => {
        if (counterRef.current) {
          counterRef.current.textContent = `${Math.round(counter.value)}%`
        }
      },
    })

    // Logo stroke animation
    if (logoRef.current) {
      const paths = logoRef.current.querySelectorAll('path')
      paths.forEach((path) => {
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
      })
      tl.to(
        logoRef.current.querySelectorAll('path'),
        { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', stagger: 0.1 },
        0
      )
    }

    // Reveal with clip-path
    tl.to(containerRef.current, {
      clipPath: 'circle(0% at 50% 50%)',
      duration: 0.8,
      ease: 'expo.in',
      delay: 0.3,
    })

    return () => {
      tl.kill()
    }
  }, [setPreloaderDone, reducedMotion])

  if (isPreloaderDone && !hasShown) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-charcoal"
      style={{ clipPath: 'circle(150% at 50% 50%)' }}
    >
      {/* Logo SVG - simple S&K text path */}
      <svg
        ref={logoRef}
        viewBox="0 0 200 60"
        className="w-48 mb-8"
        fill="none"
        stroke="#FDF6EE"
        strokeWidth="1.5"
      >
        <path d="M 20 45 C 20 45 10 42 10 35 C 10 28 20 27 25 27 C 30 27 38 26 38 20 C 38 14 30 12 25 12 C 18 12 10 15 10 15" />
        <path d="M 50 45 L 50 12 M 50 28 L 65 12 M 56 22 L 68 45" />
        <path d="M 85 20 C 85 20 92 12 100 12 C 108 12 115 18 115 28 C 115 38 108 45 100 45 C 92 45 85 38 85 28 L 85 45 M 115 28 L 115 45" />
        <path d="M 125 28 C 125 18 132 12 140 12 C 148 12 155 18 155 28 C 155 38 148 45 140 45 C 132 45 125 38 125 28" />
        <path d="M 162 12 L 162 45 M 162 12 L 170 12 C 178 12 183 17 183 24 C 183 31 178 35 170 35 L 162 35" />
      </svg>

      <span
        ref={counterRef}
        className="text-cream/60 text-sm font-mono tracking-[0.3em]"
      >
        0%
      </span>
    </div>
  )
}
