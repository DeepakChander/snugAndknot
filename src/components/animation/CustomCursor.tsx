'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useUIStore } from '@/stores/ui-store'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { useIsDesktop } from '@/hooks/use-media-query'

const TRAIL_COUNT = 8

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const followerRef = useRef<HTMLDivElement>(null)
  const trailRefs = useRef<HTMLDivElement[]>([])
  const cursorLabel = useUIStore((s) => s.cursorLabel)
  const reducedMotion = useReducedMotion()
  const isDesktop = useIsDesktop()

  useEffect(() => {
    if (reducedMotion || !isDesktop || !dotRef.current || !followerRef.current) return

    const dot = dotRef.current
    const follower = followerRef.current

    // Create quickTo instances for smooth trailing
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' })
    const followerX = gsap.quickTo(follower, 'x', { duration: 0.25, ease: 'power2.out' })
    const followerY = gsap.quickTo(follower, 'y', { duration: 0.25, ease: 'power2.out' })

    // Trail quickTo instances with increasing durations
    const trailAnimators = trailRefs.current.map((trail, i) => ({
      x: gsap.quickTo(trail, 'x', { duration: 0.1 + i * 0.05, ease: 'power2.out' }),
      y: gsap.quickTo(trail, 'y', { duration: 0.1 + i * 0.05, ease: 'power2.out' }),
    }))

    let lastX = 0
    let lastY = 0

    const onMove = (e: MouseEvent) => {
      dotX(e.clientX)
      dotY(e.clientY)
      followerX(e.clientX)
      followerY(e.clientY)

      // Calculate velocity for trail visibility
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      const velocity = Math.sqrt(dx * dx + dy * dy)

      // Trail dots follow with staggered delay
      trailAnimators.forEach((animator) => {
        animator.x(e.clientX)
        animator.y(e.clientY)
      })

      // Show/hide trail based on velocity
      trailRefs.current.forEach((trail, i) => {
        const opacity = velocity > 5 ? Math.max(0, 0.4 - i * 0.05) : 0
        gsap.to(trail, { opacity, duration: 0.15 })
      })

      lastX = e.clientX
      lastY = e.clientY
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

    window.addEventListener('mousemove', onMove, { passive: true })

    // Track elements we've attached listeners to, for proper cleanup
    const trackedElements = new Set<Element>()

    const addListenersTo = (el: Element) => {
      if (trackedElements.has(el)) return
      trackedElements.add(el)
      el.addEventListener('mouseenter', onEnterInteractive)
      el.addEventListener('mouseleave', onLeaveInteractive)
    }

    const addListeners = () => {
      document.querySelectorAll('a, button, [data-cursor]').forEach(addListenersTo)
    }

    // Initial scan
    addListeners()

    // MutationObserver to handle dynamically added elements (modals, dynamic content)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (!(node instanceof HTMLElement)) continue
          if (node.matches('a, button, [data-cursor]')) {
            addListenersTo(node)
          }
          node.querySelectorAll('a, button, [data-cursor]').forEach(addListenersTo)
        }
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      observer.disconnect()
      trackedElements.forEach((el) => {
        el.removeEventListener('mouseenter', onEnterInteractive)
        el.removeEventListener('mouseleave', onLeaveInteractive)
      })
    }
  }, [reducedMotion, isDesktop])

  if (reducedMotion || !isDesktop) return null

  return (
    <>
      {/* Trail dots */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { if (el) trailRefs.current[i] = el }}
          className="fixed top-0 left-0 rounded-full pointer-events-none z-[9997] -translate-x-1/2 -translate-y-1/2 opacity-0 bg-gold"
          style={{
            width: `${4 - i * 0.3}px`,
            height: `${4 - i * 0.3}px`,
          }}
        />
      ))}

      {/* Main dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-[4px] h-[4px] rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 bg-gold"
      />

      {/* Follower ring */}
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-11 h-11 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-colors"
        style={{ border: '1px solid rgba(91, 14, 20, 0.25)' }}
      >
        {cursorLabel && (
          <span className="text-[9px] font-medium text-burgundy uppercase tracking-widest">
            {cursorLabel}
          </span>
        )}
      </div>
    </>
  )
}
