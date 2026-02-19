'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

interface CurtainRevealProps {
  children: React.ReactNode
  index?: number
  delay?: number
}

export default function CurtainReveal({ children, index = 0, delay = 0 }: CurtainRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const leftCurtainRef = useRef<HTMLDivElement>(null)
  const rightCurtainRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return

    const leftCurtain = leftCurtainRef.current
    const rightCurtain = rightCurtainRef.current
    const content = contentRef.current
    if (!leftCurtain || !rightCurtain || !content) return

    // Set initial state
    gsap.set([leftCurtain, rightCurtain], { scaleX: 1 })
    gsap.set(content, { opacity: 0, scale: 0.95 })

    // Create reveal animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
        once: true,
      },
      delay: delay + index * 0.08,
    })

    // Curtains part from center
    tl.to(
      [leftCurtain, rightCurtain],
      {
        scaleX: 0,
        duration: 1.2,
        ease: 'expo.inOut',
        stagger: 0.05,
      },
      0
    )

    // Content fades in and scales up behind curtains
    tl.to(
      content,
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'expo.out',
      },
      0.3
    )

    return () => {
      tl.kill()
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === containerRef.current) st.kill()
      })
    }
  }, [index, delay, reducedMotion])

  if (reducedMotion) {
    return <div>{children}</div>
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Content (behind curtains) */}
      <div ref={contentRef} style={{ opacity: 0 }}>
        {children}
      </div>

      {/* Left curtain */}
      <div
        ref={leftCurtainRef}
        className="absolute inset-0 pointer-events-none origin-left"
        style={{
          background: 'linear-gradient(to right, #3D0A0E 0%, #5B0E14 100%)',
          clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)',
          transformOrigin: 'left',
        }}
      >
        {/* Gold tassel decoration */}
        <div
          className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-gold via-gold-muted to-transparent"
          style={{
            boxShadow: '0 0 8px rgba(241, 225, 148, 0.5)',
            filter: 'blur(0.5px)',
          }}
        />
      </div>

      {/* Right curtain */}
      <div
        ref={rightCurtainRef}
        className="absolute inset-0 pointer-events-none origin-right"
        style={{
          background: 'linear-gradient(to left, #3D0A0E 0%, #5B0E14 100%)',
          clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)',
          transformOrigin: 'right',
        }}
      >
        {/* Gold tassel decoration */}
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-gold via-gold-muted to-transparent"
          style={{
            boxShadow: '0 0 8px rgba(241, 225, 148, 0.5)',
            filter: 'blur(0.5px)',
          }}
        />
      </div>

      {/* Spotlight effect (fades with curtains) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(241, 225, 148, 0.15) 0%, transparent 70%)',
          opacity: 0,
          animation: 'spotlight 1.2s ease-out forwards',
          animationDelay: `${delay + index * 0.08}s`,
        }}
      />

      <style jsx>{`
        @keyframes spotlight {
          0% {
            opacity: 0.3;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
