'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function GoldDivider({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const lineLeftRef = useRef<HTMLDivElement>(null)
  const lineRightRef = useRef<HTMLDivElement>(null)
  const diamondRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current

    gsap.set([lineLeftRef.current, lineRightRef.current], { scaleX: 0 })
    gsap.set(diamondRef.current, { scale: 0, rotation: 45 })

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })

    tl.to([lineLeftRef.current, lineRightRef.current], {
      scaleX: 1,
      duration: 1.4,
      ease: 'expo.out',
    })
    tl.to(diamondRef.current, {
      scale: 1,
      rotation: 45,
      duration: 0.8,
      ease: 'expo.out',
    }, '-=0.9')

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill()
      })
    }
  }, [])

  return (
    <div ref={ref} className={`flex items-center justify-center ${className}`}>
      <div
        ref={lineLeftRef}
        className="h-px w-full max-w-[200px] origin-center bg-gold-muted"
      />
      <div
        ref={diamondRef}
        className="mx-4 h-2 w-2 shrink-0 bg-gold"
      />
      <div
        ref={lineRightRef}
        className="h-px w-full max-w-[200px] origin-center bg-gold-muted"
      />
    </div>
  )
}
