'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

const pillars = [
  {
    number: '01',
    title: 'Material over material',
    subtitle: 'Substance First',
    description:
      'We do not choose fibers for their name. We choose them for their nerve — the way they resist, yield, and remember the shape of a life lived fully.',
    accentColor: '#F1E194',
    stat: { value: '100%', label: 'Natural Fibers' },
  },
  {
    number: '02',
    title: 'The knot, not the bow',
    subtitle: 'Function Before Ornament',
    description:
      'A bow is decoration. A knot is decision. Every seam, every stitch placement exists because removing it would make the piece less. Nothing is ornamental.',
    accentColor: '#C4636B',
    stat: { value: '47', label: 'Stitch Points per Inch' },
  },
  {
    number: '03',
    title: 'Wear is not damage',
    subtitle: 'Time as Collaborator',
    description:
      'A garment that cannot age was never alive. Our textiles are designed to develop patina — to become more yours with every wearing, not less ours.',
    accentColor: '#E8D5B8',
    stat: { value: '∞', label: 'Wears by Design' },
  },
]

export default function BrandPhilosophy() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  // Staircase entrance animation
  useEffect(() => {
    if (reducedMotion || !cardsRef.current) return

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll('.philosophy-card')
      if (!cards) return

      // Heading reveal
      gsap.fromTo(
        '.philosophy-heading',
        { y: 60, opacity: 0, filter: 'blur(8px)' },
        {
          y: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      )

      // Cards stagger from different directions
      cards.forEach((card, i) => {
        const directions = [
          { x: -80, y: 0, rotateY: 5 },   // Pillar 1: from left
          { x: 0, y: 80, rotateX: 5 },    // Pillar 2: from below
          { x: 80, y: 0, rotateY: -5 },   // Pillar 3: from right
        ]

        gsap.fromTo(
          card,
          {
            ...directions[i],
            opacity: 0,
            filter: 'blur(6px)',
          },
          {
            x: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 1.4,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              once: true,
            },
          }
        )
      })

      // Stat counters
      const statValues = cardsRef.current?.querySelectorAll('.stat-value')
      statValues?.forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.5, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
              once: true,
            },
          }
        )
      })
    })

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #5B0E14 0%, #3D0A0E 40%, #0F0A0B 100%)',
      }}
    >
      {/* Knit pattern overlay */}
      <div className="absolute inset-0 knit-pattern-gold" />

      <div className="relative max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section header */}
        <div className="philosophy-heading mb-20">
          <span className="inline-block mb-4 font-mono text-[11px] text-gold/60 tracking-[0.5em] uppercase">
            Philosophy
          </span>
          <h2
            className="font-heading font-bold text-gold-pale max-w-[800px]"
            style={{ fontSize: 'clamp(2rem, 1.5rem + 3vw, 4.5rem)' }}
          >
            Three knots that hold everything together
          </h2>
        </div>

        {/* Staircase card layout */}
        <div ref={cardsRef} className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {pillars.map((pillar, i) => (
              <div
                key={pillar.number}
                className={`philosophy-card group relative ${i === 1 ? 'lg:mt-[60px]' : i === 2 ? 'lg:mt-[120px]' : ''}`}
                style={{
                  perspective: '1000px',
                }}
              >
                <div
                  className="relative rounded-2xl p-8 lg:p-10 border border-gold/[0.05] backdrop-blur-sm transition-all duration-500 group-hover:border-gold/20 group-hover:translate-y-[-4px]"
                  style={{
                    background: 'rgba(241, 225, 148, 0.03)',
                    boxShadow: 'inset 0 1px 0 rgba(241, 225, 148, 0.06)',
                  }}
                >
                  {/* Number */}
                  <div className="flex items-center gap-4 mb-6">
                    <span
                      className="font-mono text-[48px] lg:text-[64px] font-bold leading-none"
                      style={{ color: pillar.accentColor, opacity: 0.2 }}
                    >
                      {pillar.number}
                    </span>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
                  </div>

                  {/* Subtitle tag */}
                  <span className="inline-block mb-3 font-mono text-[10px] tracking-[0.4em] uppercase" style={{ color: pillar.accentColor }}>
                    {pillar.subtitle}
                  </span>

                  {/* Title */}
                  <h3 className="font-heading text-2xl lg:text-3xl text-gold-pale mb-4 leading-tight">
                    {pillar.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gold-pale/60 text-sm leading-relaxed mb-8">
                    {pillar.description}
                  </p>

                  {/* Stat */}
                  <div className="flex items-end gap-3 pt-6 border-t border-gold/[0.06]">
                    <span className="stat-value font-heading text-3xl font-bold" style={{ color: pillar.accentColor }}>
                      {pillar.stat.value}
                    </span>
                    <span className="font-mono text-[10px] text-gold-pale/40 tracking-wider uppercase pb-1">
                      {pillar.stat.label}
                    </span>
                  </div>

                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${pillar.accentColor}10 0%, transparent 70%)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="mt-24 text-center">
          <p className="font-heading text-gold-pale/40 italic" style={{ fontSize: 'clamp(1rem, 0.8rem + 1vw, 1.5rem)' }}>
            "What frays was never truly bound."
          </p>
        </div>
      </div>
    </section>
  )
}
