'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ClipRevealImage({
  src,
  alt,
  aspectClass,
  sizes,
  direction = 'up',
  delay = 0,
}: {
  src: string
  alt: string
  aspectClass: string
  sizes: string
  direction?: 'left' | 'right' | 'up' | 'center'
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const img = el.querySelector('img')

    const clips: Record<string, { from: string; to: string }> = {
      left: { from: 'inset(0 100% 0 0)', to: 'inset(0 0% 0 0)' },
      right: { from: 'inset(0 0 0 100%)', to: 'inset(0 0 0 0%)' },
      up: { from: 'inset(100% 0 0 0)', to: 'inset(0% 0 0 0)' },
      center: { from: 'inset(50% 50% 50% 50%)', to: 'inset(0% 0% 0% 0%)' },
    }

    const { from, to } = clips[direction]
    gsap.set(el, { clipPath: from })
    if (img) gsap.set(img, { scale: 1.15 })

    gsap.to(el, {
      clipPath: to,
      duration: 1.4,
      delay,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    })

    if (img) {
      gsap.to(img, {
        scale: 1,
        duration: 1.8,
        delay,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      })
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill()
      })
    }
  }, [direction, delay])

  return (
    <div ref={ref} className={`relative overflow-hidden ${aspectClass}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={sizes}
      />
    </div>
  )
}
