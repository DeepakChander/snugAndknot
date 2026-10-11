'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion/gsap'
import { getLenis } from '@/lib/motion/lenis'
import { cn } from '@/lib/format'

/**
 * Infinite marquee that speeds up, leans and flips direction with scroll velocity.
 * Children are rendered twice; the track loops at -50%.
 */
export default function Marquee({
  children,
  speed = 1,
  reverse = false,
  skew = true,
  className,
  trackClassName,
}: {
  children: React.ReactNode
  speed?: number
  reverse?: boolean
  skew?: boolean
  className?: string
  trackClassName?: string
}) {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const track = root.current?.querySelector<HTMLElement>('[data-track]')
      if (!track) return
      const reduce = prefersReducedMotion()
      let x = 0
      let dir = reverse ? 1 : -1
      let boost = 0
      const skewTo = gsap.quickTo(track, 'skewX', { duration: 0.6, ease: 'power3' })
      const tick = (_: number, dt: number) => {
        const v = reduce ? 0 : getLenis()?.velocity ?? 0
        if (Math.abs(v) > 0.5) dir = (v > 0 ? -1 : 1) * (reverse ? -1 : 1)
        boost += (Math.min(Math.abs(v) * 0.6, 18) - boost) * 0.08
        x += dir * (0.04 * speed + boost * 0.02) * (dt / 16.67) * (reduce ? 0.4 : 1)
        if (x <= -50) x += 50
        if (x > 0) x -= 50
        gsap.set(track, { xPercent: x })
        if (skew && !reduce) skewTo(Math.max(-7, Math.min(7, v * -0.3)))
      }
      gsap.ticker.add(tick)
      return () => gsap.ticker.remove(tick)
    },
    { scope: root, dependencies: [speed, reverse, skew] }
  )

  return (
    <div ref={root} className={cn('relative overflow-hidden', className)}>
      <div data-track className={cn('flex w-max will-change-transform', trackClassName)}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  )
}
