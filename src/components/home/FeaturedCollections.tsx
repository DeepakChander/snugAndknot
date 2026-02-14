'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import Image from 'next/image'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

const collections = [
  {
    title: 'The Essentials Edit',
    subtitle: 'Foundational pieces for every wardrobe',
    image: '/images/Collections-Hero/Essentials.png',
    href: '/collections/the-essentials-edit',
    number: '01',
  },
  {
    title: 'Winter Warmth',
    subtitle: 'Cozy knits for cold days ahead',
    image: '/images/Collections-Hero/Winter.png',
    href: '/collections/winter-warmth',
    number: '02',
  },
  {
    title: 'Coastal Escape',
    subtitle: 'Effortless pieces for seaside living',
    image: '/images/Collections-Hero/Coastal.png',
    href: '/collections/coastal-escape',
    number: '03',
  },
  {
    title: 'The Minimalist',
    subtitle: 'Less is more, beautifully',
    image: '/images/Collections-Hero/Minimalist.png',
    href: '/collections/the-minimalist',
    number: '04',
  },
]

export default function FeaturedCollections() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion || !sectionRef.current) return

    const ctx = gsap.context(() => {
      // Heading reveal - char by char
      if (headingRef.current) {
        const chars = headingRef.current.textContent?.split('') || []
        headingRef.current.innerHTML = chars.map((char) =>
          char === ' '
            ? '<span class="inline-block w-[0.25em]"></span>'
            : `<span class="inline-block overflow-hidden"><span class="collection-char inline-block" style="transform:translateY(110%);opacity:0">${char}</span></span>`
        ).join('')

        gsap.to('.collection-char', {
          y: '0%',
          opacity: 1,
          duration: 0.8,
          stagger: 0.025,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
          },
        })
      }

      // Cards animation
      const cards = sectionRef.current!.querySelectorAll('.collection-card')
      cards.forEach((card, i) => {
        // Card entrance
        gsap.fromTo(card,
          {
            opacity: 0,
            y: 80,
            scale: 0.92,
            rotateX: 20,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 1.2,
            delay: i * 0.15,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
            },
          }
        )

        // Image parallax
        const img = card.querySelector('.collection-img')
        if (img) {
          gsap.to(img, {
            yPercent: -12,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          })
        }

        // Content reveal
        const content = card.querySelector('.collection-content')
        if (content) {
          gsap.fromTo(content,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1,
              delay: 0.3 + i * 0.15,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top 70%',
              },
            }
          )
        }
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="relative py-20 lg:py-28 bg-cream overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sand/30 to-transparent" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-10 lg:mb-12">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-terracotta" />
              <p className="font-mono text-xs text-terracotta tracking-[0.3em] uppercase font-bold">
                Collections
              </p>
            </div>
            <div className="hidden sm:block w-16 h-[1px] bg-gradient-to-r from-terracotta/40 to-transparent" />
          </div>

          <Link
            href="/collections"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-charcoal hover:text-terracotta transition-colors"
          >
            <span className="border-b border-charcoal/30 group-hover:border-terracotta transition-colors">
              All Collections
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Compact heading */}
        <div ref={headingRef} className="mb-10 lg:mb-12">
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-charcoal tracking-tight">
            Curated for You
          </h2>
        </div>

        {/* Compact Grid - Single row on desktop, 2 cols on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 perspective-[1200px]">
          {collections.map((collection, i) => (
            <Link
              key={collection.title}
              href={collection.href}
              className="collection-card group relative block aspect-[3/4] rounded-2xl overflow-hidden bg-sand"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Image with parallax */}
              <div className="absolute inset-[-10%]">
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  quality={100}
                  priority={i < 2}
                  className="collection-img object-cover scale-110 transition-transform duration-1000 group-hover:scale-125"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>

              {/* Dynamic gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

              {/* Animated corner accent */}
              <div className="absolute top-3 left-3 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-terracotta to-transparent" />
                <div className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-terracotta to-transparent" />
              </div>

              {/* Content */}
              <div className="collection-content absolute inset-0 p-5 lg:p-6 flex flex-col justify-between">
                {/* Number tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
                    <span className="font-mono text-[10px] text-cream uppercase tracking-wider font-bold">
                      {collection.number}
                    </span>
                  </div>

                  {/* Animated indicator */}
                  <div className="w-2 h-2 rounded-full bg-terracotta opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute w-2 h-2 rounded-full bg-terracotta animate-ping" />
                  </div>
                </div>

                {/* Bottom content */}
                <div>
                  <h3 className="font-heading text-2xl lg:text-3xl text-cream mb-2 transition-all duration-500 group-hover:translate-y-[-4px] group-hover:text-shadow-lg">
                    {collection.title}
                  </h3>
                  <p className="text-cream/85 text-xs lg:text-sm mb-4 leading-relaxed transition-all duration-500 group-hover:text-cream">
                    {collection.subtitle}
                  </p>

                  {/* Explore CTA */}
                  <div className="flex items-center gap-2 transition-all duration-500 group-hover:gap-4">
                    <span className="text-cream text-xs font-bold uppercase tracking-wider">Explore</span>
                    <div className="w-6 h-[2px] bg-cream/60 group-hover:w-10 group-hover:bg-terracotta transition-all duration-500" />
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-cream transition-all duration-500 group-hover:translate-x-1 group-hover:text-terracotta"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Hover glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-terracotta/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </Link>
          ))}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes text-shadow-glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(196, 121, 90, 0.3);
          }
          50% {
            text-shadow: 0 0 20px rgba(196, 121, 90, 0.6);
          }
        }
      `}</style>
    </section>
  )
}
