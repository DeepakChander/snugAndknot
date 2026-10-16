'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion/gsap'
import { cn } from '@/lib/format'

/**
 * Infinite marquee drifting at a steady pace. Children are rendered twice; the track loops at -50%.
 * (`skew` is accepted for older call sites and no longer does anything: nothing leans with scrolling.)
 */
export default function Marquee({
  children,
  speed = 1,
  reverse = false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for older call sites
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
      const dir = reverse ? 1 : -1
      const tick = (_: number, dt: number) => {
        x += dir * 0.04 * speed * (dt / 16.67) * (reduce ? 0.4 : 1)
        if (x <= -50) x += 50
        if (x > 0) x -= 50
        gsap.set(track, { xPercent: x })
      }
      gsap.ticker.add(tick)
      return () => gsap.ticker.remove(tick)
    },
    { scope: root, dependencies: [speed, reverse] }
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
