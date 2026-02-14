'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface MarqueeProps {
  children: React.ReactNode
  speed?: number // pixels per second
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
  className?: string
}

export default function Marquee({
  children,
  speed = 50,
  direction = 'left',
  pauseOnHover = true,
  className = '',
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !innerRef.current || !containerRef.current) return

    const inner = innerRef.current
    const totalWidth = inner.scrollWidth / 2 // We duplicate content

    const tween = gsap.to(inner, {
      x: direction === 'left' ? -totalWidth : totalWidth,
      duration: totalWidth / speed,
      ease: 'none',
      repeat: -1,
    })

    if (pauseOnHover) {
      const container = containerRef.current
      const onEnter = () => gsap.to(tween, { timeScale: 0, duration: 0.5 })
      const onLeave = () => gsap.to(tween, { timeScale: 1, duration: 0.5 })
      container.addEventListener('mouseenter', onEnter)
      container.addEventListener('mouseleave', onLeave)
      return () => {
        container.removeEventListener('mouseenter', onEnter)
        container.removeEventListener('mouseleave', onLeave)
        tween.kill()
      }
    }

    return () => tween.kill()
  }, [speed, direction, pauseOnHover, reducedMotion])

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <div ref={innerRef} className="flex w-fit">
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden="true">{children}</div>
      </div>
    </div>
  )
}
