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
    title: 'The Undertow',
    subtitle: 'What pulls beneath the surface holds the shape',
    image: '/images/Collections-Hero/Essentials.png',
    href: '/collections/the-essentials-edit',
    number: '01',
  },
  {
    title: 'Held Warmth',
    subtitle: 'Knots that remember the cold so you forget it',
    image: '/images/Collections-Hero/Winter.png',
    href: '/collections/winter-warmth',
    number: '02',
  },
  {
    title: 'Salt & Selvage',
    subtitle: 'Threads that breathe with the tide',
    image: '/images/Collections-Hero/Coastal.png',
    href: '/collections/coastal-comfort',
    number: '03',
  },
  {
    title: 'The Night Loom',
    subtitle: 'When the loom dims, the work deepens',
    image: '/images/Collections-Hero/Artisan.png',
    href: '/collections/artisan-series',
    number: '04',
  },
]

export default function FeaturedCollections() {
  const sectionRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  // Diagonal entrance animations
  useEffect(() => {
    if (reducedMotion || !gridRef.current) return

    const ctx = gsap.context(() => {
      // Heading
      gsap.fromTo(
        '.collections-heading',
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.2, ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%', once: true },
        }
      )

      // Cards with diagonal stagger
      const cards = gridRef.current?.querySelectorAll('.collection-card')
      cards?.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 100 + i * 30, opacity: 0, rotateX: 8, scale: 0.95 },
          {
            y: 0, opacity: 1, rotateX: 0, scale: 1,
            duration: 1.4, ease: 'expo.out',
            scrollTrigger: { trigger: card, start: 'top 90%', once: true },
          }
        )
      })
    })

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="relative py-32 bg-ivory overflow-hidden">
      <div className="relative max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section header */}
        <div className="collections-heading mb-16">
          <span className="inline-block mb-4 font-mono text-[11px] text-rosewood tracking-[0.5em] uppercase">
            Collections
          </span>
          <h2
            className="font-heading font-bold text-burgundy"
            style={{ fontSize: 'clamp(2rem, 1.5rem + 3vw, 4.5rem)' }}
          >
            Curated tensions
          </h2>
        </div>

        {/* Diagonal overlapping gallery */}
        <div ref={gridRef} className="relative">
          {/* Desktop: 4-column grid with stagger offsets */}
          <div className="hidden lg:grid lg:grid-cols-4 gap-5 relative">
            {collections.map((col, i) => (
              <Link
                key={col.number}
                href={col.href}
                className="collection-card group block overflow-hidden rounded-xl"
                style={{
                  marginTop: i % 2 === 1 ? '60px' : '0px',
                  perspective: '1000px',
                }}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl transition-all duration-500 group-hover:scale-[1.03] group-hover:z-10">
                  <Image
                    src={col.image}
                    alt={col.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="480px"
                  />

                  {/* Burgundy gradient overlay */}
                  <div
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(to top, rgba(91,14,20,0.85) 0%, rgba(91,14,20,0.3) 50%, transparent 100%)',
                    }}
                  />

                  {/* Hover: gold border */}
                  <div className="absolute inset-0 rounded-xl border-2 border-gold/0 group-hover:border-gold/40 transition-all duration-500" />

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span className="font-mono text-[10px] text-gold/60 tracking-[0.4em] uppercase">
                      {col.number}
                    </span>
                    <h3 className="font-heading text-3xl text-gold-pale mt-2 mb-2 transition-all duration-500 group-hover:text-gold">
                      {col.title}
                    </h3>
                    <p className="text-gold-pale/60 text-sm">
                      {col.subtitle}
                    </p>

                    {/* Arrow */}
                    <div className="mt-4 flex items-center gap-2 text-gold/70 group-hover:text-gold transition-colors">
                      <span className="text-xs font-medium uppercase tracking-widest">Explore</span>
                      <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile: horizontal snap carousel */}
          <div className="lg:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 no-scrollbar">
            {collections.map((col) => (
              <Link
                key={col.number}
                href={col.href}
                className="collection-card flex-shrink-0 snap-center block overflow-hidden rounded-xl"
                style={{ width: '85vw', maxWidth: '360px' }}
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                  <Image
                    src={col.image}
                    alt={col.title}
                    fill
                    className="object-cover"
                    sizes="85vw"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(91,14,20,0.85) 0%, rgba(91,14,20,0.2) 60%, transparent 100%)',
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="font-mono text-[10px] text-gold/60 tracking-[0.4em] uppercase">{col.number}</span>
                    <h3 className="font-heading text-2xl text-gold-pale mt-1 mb-1">{col.title}</h3>
                    <p className="text-gold-pale/50 text-sm">{col.subtitle}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
