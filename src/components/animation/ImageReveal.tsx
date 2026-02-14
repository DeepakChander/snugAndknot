'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

interface ImageRevealProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  revealDirection?: 'left' | 'right' | 'up' | 'down' | 'center'
  priority?: boolean
}

export default function ImageReveal({
  src,
  alt,
  width,
  height,
  className = '',
  revealDirection = 'up',
  priority = false,
}: ImageRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return

    const el = containerRef.current
    const img = el.querySelector('img')

    const getClipPath = () => {
      switch (revealDirection) {
        case 'left':
          return { from: 'inset(0 100% 0 0)', to: 'inset(0 0% 0 0)' }
        case 'right':
          return { from: 'inset(0 0 0 100%)', to: 'inset(0 0 0 0%)' }
        case 'down':
          return { from: 'inset(0 0 100% 0)', to: 'inset(0 0 0% 0)' }
        case 'center':
          return { from: 'inset(50% 50% 50% 50%)', to: 'inset(0% 0% 0% 0%)' }
        case 'up':
        default:
          return { from: 'inset(100% 0 0 0)', to: 'inset(0% 0 0 0)' }
      }
    }

    const { from, to } = getClipPath()

    gsap.set(el, { clipPath: from })
    if (img) gsap.set(img, { scale: 1.2 })

    gsap.to(el, {
      clipPath: to,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
    })

    if (img) {
      gsap.to(img, {
        scale: 1,
        duration: 1.4,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      })
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill()
      })
    }
  }, [revealDirection, reducedMotion])

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover"
        priority={priority}
      />
    </div>
  )
}
