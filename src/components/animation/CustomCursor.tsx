'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useUIStore } from '@/stores/ui-store'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { useIsDesktop } from '@/hooks/use-media-query'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  const cursorLabel = useUIStore((s) => s.cursorLabel)
  const reducedMotion = useReducedMotion()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    if (reducedMotion || !isDesktop || !dotRef.current || !followerRef.current) return

    const dot = dotRef.current
    const follower = followerRef.current

    const onMove = (e: MouseEvent) => {
      gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' })
      gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.3, ease: 'power2.out' })
    }

    const onEnterInteractive = () => {
      gsap.to(follower, { scale: 2, duration: 0.3, ease: 'expo.out' })
      gsap.to(dot, { scale: 0, duration: 0.3 })
    }

    const onLeaveInteractive = () => {
      gsap.to(follower, { scale: 1, duration: 0.3, ease: 'expo.out' })
      gsap.to(dot, { scale: 1, duration: 0.3 })
    }

    window.addEventListener('mousemove', onMove)

    const interactives = document.querySelectorAll('a, button, [data-cursor]')
    interactives.forEach((el) => {
      el.addEventListener('mouseenter', onEnterInteractive)
      el.addEventListener('mouseleave', onLeaveInteractive)
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      interactives.forEach((el) => {
        el.removeEventListener('mouseenter', onEnterInteractive)
        el.removeEventListener('mouseleave', onLeaveInteractive)
      })
    }
  }, [reducedMotion, isDesktop])

  if (reducedMotion || !isDesktop) return null

  return (
    <>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-charcoal rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-10 h-10 border border-charcoal/30 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
      >
        {cursorLabel && (
          <span className="text-[10px] font-medium text-charcoal uppercase tracking-widest">
            {cursorLabel}
          </span>
        )}
      </div>
    </>
  )
}
