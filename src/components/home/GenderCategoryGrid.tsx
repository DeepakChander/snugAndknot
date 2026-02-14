'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from '@/components/animation/TextReveal'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

const categories = [
  {
    title: 'Men',
    description: 'Timeless essentials for the modern man',
    href: '/shop/men',
    image: '/images/hero-main.jpg',
    tag: 'Explore',
  },
  {
    title: 'Women',
    description: 'Elegant pieces crafted with intention',
    href: '/shop/women',
    image: '/images/hero-main.jpg',
    tag: 'Explore',
  },
  {
    title: 'Kids',
    description: 'Comfortable clothing for little adventurers',
    href: '/shop/kids',
    image: '/images/hero-main.jpg',
    tag: 'Explore',
  },
]

export default function GenderCategoryGrid() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      const cards = sectionRef.current!.querySelectorAll('.gender-card')
      cards.forEach((card, i) => {
        gsap.fromTo(card,
          { opacity: 0, y: 60, clipPath: 'inset(10% 0% 10% 0%)' },
          {
            opacity: 1,
            y: 0,
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.2,
            delay: i * 0.15,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-36 bg-cream-dark">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 lg:mb-20 text-center">
          <p className="font-mono text-xs text-terracotta tracking-[0.3em] uppercase mb-3">Shop</p>
          <TextReveal as="h2" className="text-4xl sm:text-5xl lg:text-7xl text-charcoal mb-4">
            Shop by Category
          </TextReveal>
          <p className="text-walnut max-w-md mx-auto text-sm">
            Discover our complete range of premium clothing for everyone
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {categories.map((category, i) => (
            <Link
              key={category.title}
              href={category.href}
              className="gender-card group relative block aspect-[3/4] rounded-2xl overflow-hidden bg-sand"
            >
              {/* Image */}
              <div className="absolute inset-0">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent transition-opacity duration-700 group-hover:from-charcoal/90" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-7 lg:p-9 flex flex-col justify-end">
                {/* Tag */}
                <span className="font-mono text-[10px] text-cream/80 uppercase tracking-[0.3em] mb-3 transition-all duration-500 group-hover:text-terracotta group-hover:translate-x-1">
                  {String(i + 1).padStart(2, '0')} &mdash; {category.tag}
                </span>

                <h3 className="font-heading text-4xl lg:text-5xl text-cream mb-2 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-2">
                  {category.title}
                </h3>
                <p className="text-cream/85 text-sm mb-5 max-w-xs transition-all duration-500 group-hover:translate-x-2 group-hover:text-cream">
                  {category.description}
                </p>

                {/* Arrow line CTA */}
                <div className="flex items-center gap-3 transition-all duration-500 group-hover:gap-5">
                  <span className="text-cream text-xs font-medium uppercase tracking-wider">Shop Now</span>
                  <div className="w-6 h-[1px] bg-cream/70 group-hover:w-10 transition-all duration-500" />
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-cream transition-transform duration-500 group-hover:translate-x-1"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Hover accent glow */}
              <div className="absolute inset-0 bg-terracotta/0 group-hover:bg-terracotta/[0.06] transition-colors duration-700" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
