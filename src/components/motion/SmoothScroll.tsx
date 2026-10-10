'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion/gsap'
import { setLenis } from '@/lib/motion/lenis'

/** Lenis smooth scrolling driven by GSAP's ticker so ScrollTrigger and Lenis share one clock. */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      syncTouch: false,
      touchMultiplier: 1.4,
      wheelMultiplier: 1,
    })
    setLenis(lenis)
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
      delete (window as unknown as { __lenis?: Lenis }).__lenis
    }
  }, [])
  return null
}
