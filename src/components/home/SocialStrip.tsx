'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import TextReveal from '@/components/animation/TextReveal'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

const socialImages = [
  { src: '/images/social/ig-1.jpg', alt: 'Instagram post 1' },
  { src: '/images/social/ig-2.jpg', alt: 'Instagram post 2' },
  { src: '/images/social/ig-3.jpg', alt: 'Instagram post 3' },
  { src: '/images/social/ig-4.jpg', alt: 'Instagram post 4' },
  { src: '/images/social/ig-5.jpg', alt: 'Instagram post 5' },
  { src: '/images/social/ig-6.jpg', alt: 'Instagram post 6' },
]

export default function SocialStrip() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !stripRef.current) return

    const ctx = gsap.context(() => {
      // Horizontal scroll parallax for the images
      gsap.to(stripRef.current, {
        x: -100,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Individual card reveals
      const cards = sectionRef.current!.querySelectorAll('.social-card')
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            delay: i * 0.08,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-cream overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <p className="font-mono text-xs text-terracotta tracking-[0.3em] uppercase mb-3">Follow Along</p>
        <TextReveal as="h2" className="text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-3">
          @snugandknot
        </TextReveal>
        <p className="text-walnut text-sm">Daily inspiration from our community</p>
      </div>

      <div ref={stripRef} className="flex gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8">
        {socialImages.map((img, i) => (
          <a
            key={i}
            href="https://instagram.com/snugandknot"
            target="_blank"
            rel="noopener noreferrer"
            className="social-card group shrink-0 w-[200px] sm:w-[250px] lg:w-[280px] aspect-square rounded-xl overflow-hidden bg-cream-dark relative"
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={280}
              height={280}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0 grayscale-[20%]"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/30 transition-all duration-500 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:translate-y-0 translate-y-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
