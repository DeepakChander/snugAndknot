'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import Accordion from '@/components/ui/Accordion'

gsap.registerPlugin(ScrollTrigger)

const CareScene = dynamic(() => import('@/components/3d/CareScene'), {
  ssr: false,
  loading: () => null,
})

const materials = [
  {
    name: 'Cotton',
    description: 'Natural, breathable, and soft against the skin',
    color: '#F5EFE0',
    gradient: 'from-parchment/30 to-ivory/20',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1M5.6 5.6l.7.7m12.1 12.1l.7.7M5.6 18.4l.7-.7M18.4 5.6l.7-.7" />
      </svg>
    ),
    items: [
      { title: 'Washing', content: 'Machine wash cold (30°C/86°F) on a gentle cycle. Turn garments inside out before washing to preserve color and surface texture. Use a mild, pH-neutral detergent. Avoid bleach or fabric softeners.' },
      { title: 'Drying', content: 'Lay flat to dry on a clean towel, reshaping while damp. Avoid tumble drying, as heat can cause shrinkage and weaken cotton fibers over time. Keep away from direct sunlight to prevent fading.' },
      { title: 'Ironing', content: 'Iron on medium heat while slightly damp for best results. Use a pressing cloth for darker colors to prevent shine. Steam works well for removing wrinkles without direct contact.' },
      { title: 'Storage', content: 'Fold and store in a cool, dry place. Avoid hanging knit cotton garments as they can stretch. Use cedar blocks or lavender sachets to deter moths naturally.' },
    ],
  },
  {
    name: 'Wool & Merino',
    description: 'Luxuriously warm with natural temperature regulation',
    color: '#5B0E14',
    gradient: 'from-burgundy/20 to-wine/10',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    items: [
      { title: 'Washing', content: 'Hand wash in cool water (20°C/68°F) with a wool-specific detergent. Gently agitate without wringing or twisting. Soak for no more than 10 minutes. For merino, a gentle machine cycle in a mesh bag is acceptable.' },
      { title: 'Drying', content: 'Gently press out excess water by rolling in a clean towel — never wring. Reshape on a flat surface and dry away from heat sources. Wool can take 24-48 hours to dry completely; this is normal.' },
      { title: 'Ironing', content: 'Steam is preferred over direct ironing. If ironing is necessary, use the wool setting with a pressing cloth. Never iron directly on the surface as it can flatten the natural texture.' },
      { title: 'Storage', content: 'Always clean before storing. Fold neatly and store with cedar or lavender. Never hang wool garments — they stretch under their own weight. Allow garments to rest 24 hours between wearings to recover their shape.' },
    ],
  },
  {
    name: 'Linen',
    description: 'Crisp, cooling, and naturally elegant',
    color: '#E8DCC8',
    gradient: 'from-sand/30 to-parchment/20',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M7 2.2C6 4.7 6 8 6 8s3.3 0 5.8-1" strokeLinecap="round" />
        <path d="M17 2.2c1 2.5 1 5.8 1 5.8s-3.3 0-5.8-1" strokeLinecap="round" />
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      </svg>
    ),
    items: [
      { title: 'Washing', content: 'Machine wash warm (40°C/104°F) on a gentle cycle, or hand wash. Linen gets softer with each wash. Use mild detergent and avoid overloading the machine. Separate dark and light colors.' },
      { title: 'Drying', content: 'Line dry or lay flat. Linen dries quickly naturally. If using a tumble dryer, use low heat and remove while slightly damp to prevent over-drying and excessive wrinkling.' },
      { title: 'Ironing', content: 'Iron on high heat while damp for a crisp finish, or embrace the natural wrinkle that gives linen its character. A light mist of water before ironing helps achieve smooth results.' },
      { title: 'Storage', content: 'Store in a breathable fabric bag or on padded hangers. Linen does well hung, unlike knits. Avoid plastic storage as linen needs air circulation to prevent yellowing.' },
    ],
  },
  {
    name: 'Blended Fabrics',
    description: 'The best of multiple fibers in harmony',
    color: '#BFA88E',
    gradient: 'from-gold/20 to-sand/15',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path d="M2 12l10 5 10-5M2 17l10 5 10-5M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    items: [
      { title: 'Washing', content: 'Follow the care of the most delicate fiber in the blend. When in doubt, cold wash on gentle. Our cashmere-cotton blends should be treated as cashmere. Our wool-linen blends should be treated as wool.' },
      { title: 'Drying', content: 'Always lay flat to dry for any blend containing wool or cashmere. Cotton-linen blends can be hung or laid flat. Avoid all heat sources during drying.' },
      { title: 'Ironing', content: 'Use the lowest recommended heat setting among the fiber types in the blend. Always test on an inconspicuous area first. A pressing cloth is recommended for all blends.' },
      { title: 'Storage', content: 'Fold blends containing any animal fibers (wool, cashmere, alpaca). Use moth deterrents. Cotton-linen blends can be hung on padded hangers. Keep all garments in a cool, dry environment.' },
    ],
  },
]

const careSymbols = [
  {
    title: 'Wash Less',
    description: 'Most garments don\'t need washing after every wear. Spot clean stains and air out between wearings to extend the life of your clothes.',
    color: 'from-blue-500/10 to-blue-400/5',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
        <path d="M12 2v10" />
      </svg>
    ),
  },
  {
    title: 'Cold Water',
    description: 'Cold water is gentler on fibers, uses less energy, and prevents shrinkage. It works just as well for everyday cleaning.',
    color: 'from-cyan-500/10 to-cyan-400/5',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h3M5 5l1.5 1.5M12 2v3M19 5l-1.5 1.5M22 12h-3" />
        <circle cx="12" cy="12" r="7" />
        <path d="M12 9v6M9 12h6" />
      </svg>
    ),
  },
  {
    title: 'Skip Dry Cleaning',
    description: 'Our garments are designed to be washed at home. Save dry cleaning for stubborn stains or heavily structured pieces.',
    color: 'from-green-500/10 to-green-400/5',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z" />
        <path d="M16 8L2 22M17.5 15H9" />
      </svg>
    ),
  },
  {
    title: 'Repair, Don\'t Replace',
    description: 'A small snag or loose thread isn\'t the end. We offer free lifetime repairs for all Snug&Knot garments. Contact us for details.',
    color: 'from-gold/10 to-gold/5',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        <path d="M15 5l4 4" />
      </svg>
    ),
  },
]

export default function CareInstructionsPage() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeMaterial, setActiveMaterial] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const materialsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(scrolled / maxScroll)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Material cards stagger animation
      const materialCards = document.querySelectorAll('.material-card')
      materialCards.forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            opacity: 0,
            y: 80,
            rotateX: -20,
            scale: 0.9,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              end: 'top 50%',
              scrub: 1,
              onEnter: () => setActiveMaterial(index),
            },
          }
        )
      })

      // Care symbols floating animation
      const symbols = document.querySelectorAll('.care-symbol')
      symbols.forEach((symbol, index) => {
        gsap.fromTo(
          symbol,
          {
            opacity: 0,
            y: 60,
            scale: 0.8,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: symbol,
              start: 'top 85%',
            },
          }
        )

        // Continuous floating
        gsap.to(symbol, {
          y: -10,
          duration: 2 + index * 0.3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
      })

      // Material icon 3D hover
      const icons = document.querySelectorAll('.material-icon')
      icons.forEach((icon) => {
        const element = icon as HTMLElement

        element.addEventListener('mouseenter', () => {
          gsap.to(element, {
            rotateY: 360,
            scale: 1.2,
            duration: 0.6,
            ease: 'back.out(1.5)',
          })
        })

        element.addEventListener('mouseleave', () => {
          gsap.to(element, {
            rotateY: 0,
            scale: 1,
            duration: 0.4,
            ease: 'power2.out',
          })
        })
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="relative bg-ivory min-h-screen overflow-hidden">
      {/* Hero Section with 3D Background */}
      <div ref={heroRef} className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8" style={{ perspective: '1000px' }}>
        {/* 3D Scene Background */}
        <div className="absolute inset-0 opacity-30">
          <CareScene scrollProgress={scrollProgress} activeMaterial={activeMaterial} />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory/95 to-ivory/90 pointer-events-none" />
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, #5B0E14 0%, #D4A843 50%, transparent 80%)' }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <FadeIn delay={0.1}>
            <p className="font-mono text-xs text-gold tracking-[0.4em] uppercase mb-6">
              Fiber Care Guide
            </p>
          </FadeIn>

          <TextReveal
            as="h1"
            className="text-5xl sm:text-6xl lg:text-7xl text-burgundy mb-6 font-heading"
          >
            Care Instructions
          </TextReveal>

          <FadeIn delay={0.2}>
            <p className="text-lg sm:text-xl text-wine/80 leading-relaxed max-w-3xl mx-auto mb-8">
              Every fiber has a memory. Treat it well and it will remember your shape, your warmth, your story.
              Here is how to keep the conversation going.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="inline-block w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          </FadeIn>
        </div>
      </div>

      {/* Material-Specific Care */}
      <div ref={materialsRef} className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeIn delay={0.1}>
          <h2 className="font-heading text-3xl sm:text-4xl text-burgundy mb-4 text-center">
            Know Your Fabrics
          </h2>
          <p className="text-center text-wine/70 mb-16 max-w-2xl mx-auto">
            Each material speaks a different language. Learn the dialect of your wardrobe.
          </p>
        </FadeIn>

        <div className="space-y-12" style={{ perspective: '1500px' }}>
          {materials.map((material, index) => (
            <div
              key={material.name}
              className="material-card"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${material.gradient} border border-gold/20 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500`}>
                {/* Decorative corner glow */}
                <div
                  className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${material.color} 0%, transparent 70%)` }}
                />

                {/* Header */}
                <div className="relative z-10 p-8 pb-6">
                  <div className="flex items-center gap-6 mb-4">
                    {/* Icon */}
                    <div
                      className="material-icon w-16 h-16 rounded-2xl bg-gradient-to-br from-burgundy/10 to-gold/10 flex items-center justify-center text-burgundy border border-gold/20 shadow-lg"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {material.icon}
                    </div>

                    {/* Title & Description */}
                    <div className="flex-1">
                      <h3 className="font-heading text-3xl text-burgundy mb-1">
                        {material.name}
                      </h3>
                      <p className="text-sm text-wine/60 italic">
                        {material.description}
                      </p>
                    </div>

                    {/* Color swatch */}
                    <div
                      className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                      style={{ backgroundColor: material.color }}
                    />
                  </div>
                </div>

                {/* Accordion Content */}
                <div className="relative z-10 px-8 pb-8">
                  <Accordion
                    items={material.items.map((item) => ({
                      title: item.title,
                      content: item.content,
                    }))}
                  />
                </div>

                {/* Bottom decorative line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-20">
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* General Care Tips */}
      <div className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle, #D4A843 1.5px, transparent 1.5px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <FadeIn delay={0.1}>
            <h2 className="font-heading text-3xl sm:text-4xl text-burgundy mb-4 text-center">
              Universal Care Wisdom
            </h2>
            <p className="text-center text-wine/70 mb-12 max-w-2xl mx-auto">
              Simple principles that extend the life of all your garments
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {careSymbols.map((item, index) => (
              <FadeIn key={item.title} delay={0.15 + index * 0.1}>
                <div
                  className="care-symbol group relative overflow-hidden rounded-xl bg-gradient-to-br from-parchment/60 to-ivory/40 border border-gold/15 p-6 cursor-pointer hover:border-gold/40 hover:shadow-2xl transition-all duration-500"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="w-16 h-16 mb-4 text-burgundy transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                      {item.icon}
                    </div>
                    <h3 className="font-heading text-xl text-burgundy mb-3 group-hover:text-burgundy-deep transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-sm text-wine/70 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gold/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <FadeIn delay={0.2}>
          <div className="relative overflow-hidden rounded-2xl border border-gold/30 shadow-2xl group">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-burgundy-deep via-noir to-burgundy animate-gradient-slow" />

            {/* Pattern overlay */}
            <div
              className="knit-pattern-gold absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700"
            />

            {/* Radial glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20"
              style={{ background: 'radial-gradient(circle, #D4A843 0%, transparent 70%)' }}
            />

            {/* Content */}
            <div className="relative z-10 text-center p-12">
              <h3 className="font-heading text-3xl sm:text-4xl text-gold-pale mb-4">
                Free Lifetime Repairs
              </h3>
              <p className="text-gold-pale/70 mb-8 max-w-xl mx-auto leading-relaxed">
                A loose button, a small tear, a pulled thread — we'll fix it for free, forever.
                That's our commitment to you and the planet.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-10 py-4 text-sm font-semibold uppercase tracking-wider bg-gold text-burgundy-deep hover:bg-gold-pale hover:scale-105 transition-all duration-300 rounded-full shadow-lg hover:shadow-2xl"
              >
                Request a Repair
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm text-burgundy hover:text-gold transition-colors duration-300"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="rotate-180 transition-transform duration-300 group-hover:-translate-x-1"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
