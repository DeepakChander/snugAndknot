'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

interface ParallaxImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  speed?: number // 0.1 to 0.3 recommended, default 0.15
  priority?: boolean
}

export default function ParallaxImage({
  src,
  alt,
  width,
  height,
  className = '',
  speed = 0.15,
  priority = false,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return

    const el = containerRef.current
    const img = el.querySelector('img')
    if (!img) return

    gsap.to(img, {
      yPercent: -speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill()
      })
    }
  }, [speed, reducedMotion])

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover scale-[1.2]"
        priority={priority}
      />
    </div>
  )
}
