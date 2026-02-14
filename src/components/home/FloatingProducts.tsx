'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

interface FloatingImage {
  src: string
  alt: string
  size: number
  top: string
  left: string
  delay: number
  speed: number
}

const floatingImages: FloatingImage[] = [
  {
    src: '/images/hero-main.jpg',
    alt: 'Premium fashion collection',
    size: 180,
    top: '15%',
    left: '5%',
    delay: 0,
    speed: 0.5,
  },
  {
    src: '/images/hero-main.jpg',
    alt: 'Elegant autumn collection',
    size: 220,
    top: '60%',
    left: '8%',
    delay: 0.2,
    speed: 0.7,
  },
  {
    src: '/images/hero-main.jpg',
    alt: 'Premium accessories',
    size: 140,
    top: '35%',
    left: '85%',
    delay: 0.4,
    speed: 0.6,
  },
  {
    src: '/images/hero-main.jpg',
    alt: 'Luxury outerwear',
    size: 200,
    top: '75%',
    left: '82%',
    delay: 0.1,
    speed: 0.8,
  },
]

export default function FloatingProducts() {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return

    const images = containerRef.current.querySelectorAll('.floating-image')

    images.forEach((img, i) => {
      const floatData = floatingImages[i]

      // Floating animation
      gsap.to(img, {
        y: '+=20',
        duration: 2 + floatData.delay,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: floatData.delay,
      })

      // Slight rotation
      gsap.to(img, {
        rotation: '+=5',
        duration: 3 + floatData.delay,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: floatData.delay * 0.5,
      })

      // Parallax on scroll
      gsap.to(img, {
        yPercent: -20 * floatData.speed,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Entrance animation
      gsap.from(img, {
        scale: 0,
        opacity: 0,
        duration: 1,
        delay: 2.8 + floatData.delay,
        ease: 'back.out(1.7)',
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === containerRef.current) t.kill()
      })
    }
  }, [reducedMotion])

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none hidden lg:block">
      {floatingImages.map((img, i) => (
        <div
          key={i}
          className="floating-image absolute rounded-2xl overflow-hidden shadow-2xl"
          style={{
            top: img.top,
            left: img.left,
            width: img.size,
            height: img.size,
          }}
        >
          <div className="relative w-full h-full">
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover"
              sizes="300px"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          </div>
        </div>
      ))}
    </div>
  )
}
