'use client'

import { useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from 'gsap'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { useUIStore } from '@/stores/ui-store'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const curtainRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const prevPathname = useRef(pathname)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (pathname === prevPathname.current) return
    prevPathname.current = pathname

    if (reducedMotion || !curtainRef.current || !contentRef.current) {
      window.scrollTo(0, 0)
      return
    }

    const lenisStop = useUIStore.getState().lenisStop
    const lenisStart = useUIStore.getState().lenisStart

    lenisStop?.()

    const tl = gsap.timeline({
      onComplete: () => {
        lenisStart?.()
        window.scrollTo(0, 0)
      },
    })

    // Curtain reveals new page with diagonal wipe
    tl.fromTo(
      curtainRef.current,
      { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
      {
        clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
        duration: 0.28,
        ease: 'power2.inOut',
      }
    )

    // Subtle entrance for content
    tl.fromTo(
      contentRef.current,
      { opacity: 0.8, y: 12 },
      { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' },
      '-=0.12'
    )
  }, [pathname, reducedMotion])

  return (
    <div className="relative">
      {/* Transition curtain */}
      <div
        ref={curtainRef}
        data-transition-curtain
        className="fixed inset-0 z-[9999] pointer-events-none"
        style={{
          backgroundColor: 'var(--color-burgundy-deep)',
          clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
        }}
      >
        <div className="absolute inset-0 knit-pattern-gold opacity-30" />
      </div>

      {/* Page content */}
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  )
}
