'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { useIsDesktop } from '@/hooks/use-media-query'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    if (reducedMotion || !isDesktop || !dotRef.current || !followerRef.current) return

    const dot = dotRef.current
    const follower = followerRef.current

    // Smooth trailing via quickTo
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' })
    const followerX = gsap.quickTo(follower, 'x', { duration: 0.25, ease: 'power2.out' })
    const followerY = gsap.quickTo(follower, 'y', { duration: 0.25, ease: 'power2.out' })

    const onMove = (e: MouseEvent) => {
      dotX(e.clientX)
      dotY(e.clientY)
      followerX(e.clientX)
      followerY(e.clientY)
    }

    const onEnterInteractive = () => {
      gsap.to(follower, {
        scale: 2,
        backgroundColor: 'rgba(241, 225, 148, 0.08)',
        borderColor: 'rgba(241, 225, 148, 0.3)',
        duration: 0.3,
        ease: 'expo.out',
      })
      gsap.to(dot, { scale: 0, duration: 0.3 })
    }

    const onLeaveInteractive = () => {
      gsap.to(follower, {
        scale: 1,
        backgroundColor: 'transparent',
        borderColor: 'rgba(91, 14, 20, 0.25)',
        duration: 0.3,
        ease: 'expo.out',
      })
      gsap.to(dot, { scale: 1, duration: 0.3 })
    }

    // Event delegation instead of MutationObserver — simpler and cheaper
    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as Element)?.closest?.('a, button, [data-cursor]')
      if (target) onEnterInteractive()
    }

    const onMouseOut = (e: MouseEvent) => {
      const target = (e.target as Element)?.closest?.('a, button, [data-cursor]')
      const related = (e.relatedTarget as Element)?.closest?.('a, button, [data-cursor]')
      if (target && target !== related) onLeaveInteractive()
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onMouseOver, { passive: true })
    document.addEventListener('mouseout', onMouseOut, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout', onMouseOut)
    }
  }, [reducedMotion, isDesktop])

  if (reducedMotion || !isDesktop) return null

  return (
    <>
      {/* Main dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-[4px] h-[4px] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 bg-gold"
      />
      {/* Follower ring */}
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-11 h-11 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2"
        style={{ border: '1px solid rgba(91, 14, 20, 0.25)' }}
      />
    </>
  )
}
