'use client'

import { useRef, useEffect, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import Link from 'next/link'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

/* ──────────────────────────────────────────────────────────
   DATA
   ────────────────────────────────────────────────────────── */

const stats = [
  { value: 142, suffix: '+', label: 'Artisan Partners' },
  { value: 35, suffix: 'K+', label: 'Happy Customers' },
  { value: 98, suffix: '%', label: 'Sustainable Materials' },
  { value: 12, suffix: '', label: 'Countries Shipped' },
]

const values = [
  {
    title: 'Thoughtfully Designed',
    description:
      'Every piece begins with intention. We design for real life, creating garments that move with you from morning to evening.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Sustainably Sourced',
    description:
      'We partner with responsible mills and suppliers to ensure our materials meet the highest environmental standards.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeLinecap="round" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 2.2C6 4.7 6 8 6 8s3.3 0 5.8-1" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 2.2c1 2.5 1 5.8 1 5.8s-3.3 0-5.8-1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Crafted with Care',
    description:
      'Our artisan partners bring decades of expertise to every stitch, ensuring each garment meets our exacting quality standards.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Made to Last',
    description:
      'We believe in buying less but better. Our pieces are designed to endure, both in construction and in style.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const timeline = [
  { year: '2020', event: 'Founded with a small collection of 12 essential pieces.' },
  { year: '2021', event: 'Expanded to 5 categories. Launched sustainable packaging initiative.' },
  { year: '2022', event: 'Opened our flagship studio in SoHo, New York.' },
  { year: '2023', event: 'Reached 25,000 customers worldwide. Partnered with 100+ artisans.' },
  { year: '2024', event: 'Launched our certified carbon-neutral shipping program.' },
  { year: '2025', event: 'Introduced our AW25 collection, our most ambitious yet.' },
]

/* ──────────────────────────────────────────────────────────
   MAIN PAGE
   ────────────────────────────────────────────────────────── */

export default function AboutPage() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="pt-24 pb-0 bg-ivory">
      {/* ═══════════════════════════════════════════════════
          HERO SPLIT — Left Headline + Right Clip-Path Image
         ═══════════════════════════════════════════════════ */}
      <HeroSplit reducedMotion={reducedMotion} />

      {/* ═══════════════════════════════════════════════════
          STATS BAND — Full-width burgundy bg, gold numbers
         ═══════════════════════════════════════════════════ */}
      <StatsBand reducedMotion={reducedMotion} />

      {/* ═══════════════════════════════════════════════════
          VALUES GRID — 2-col staggered masonry
         ═══════════════════════════════════════════════════ */}
      <ValuesGrid reducedMotion={reducedMotion} />

      {/* ═══════════════════════════════════════════════════
          PHILOSOPHY PILLARS — Three knots
         ═══════════════════════════════════════════════════ */}
      <PhilosophySection />

      {/* ═══════════════════════════════════════════════════
          TIMELINE — Vertical gold thread + year nodes
         ═══════════════════════════════════════════════════ */}
      <TimelineSection reducedMotion={reducedMotion} />

      {/* ═══════════════════════════════════════════════════
          CLOSING CTA
         ═══════════════════════════════════════════════════ */}
      <ClosingCTA />
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
   1 · HERO SPLIT
   Diagonal clip-path image reveal on scroll
   ────────────────────────────────────────────────────────── */

function HeroSplit({ reducedMotion }: { reducedMotion: boolean }) {
  const imageWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reducedMotion || !imageWrapRef.current) return

    const el = imageWrapRef.current

    // Start clipped diagonally from top-right
    gsap.set(el, {
      clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
    })

    gsap.to(el, {
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      duration: 1.4,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        once: true,
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill()
      })
    }
  }, [reducedMotion])

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-0 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[70vh]">
        {/* LEFT — Headline & Copy */}
        <div className="order-2 lg:order-1">
          <p className="text-xs font-semibold text-gold-muted uppercase tracking-[0.3em] mb-4">
            Our Story
          </p>
          <TextReveal
            as="h1"
            className="text-5xl sm:text-6xl lg:text-7xl text-burgundy mb-6 leading-[1.05]"
          >
            Woven with Intention
          </TextReveal>
          <FadeIn delay={0.2}>
            <p className="text-wine text-lg leading-relaxed mb-6 max-w-lg">
              Snug&Knot was born from a simple belief: that the clothes we wear
              should feel as good as they look. Founded in 2020, we set out to
              create a fashion brand that honors craft, celebrates simplicity,
              and respects the world we live in.
            </p>
            <p className="text-wine/80 leading-relaxed max-w-lg">
              Every piece in our collection is thoughtfully designed to be
              versatile, enduring, and effortlessly elegant. We work with
              artisan partners around the world who share our commitment to
              quality and sustainability.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="mt-8 flex gap-4">
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold tracking-wide uppercase rounded-none transition-all duration-300 bg-burgundy text-gold hover:bg-burgundy-deep hover:shadow-[0_8px_32px_-8px_rgba(91,14,20,0.4)]"
              >
                Explore Collections
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* RIGHT — Clip-path Image Reveal */}
        <div className="order-1 lg:order-2">
          <div
            ref={imageWrapRef}
            className="relative aspect-[4/5] overflow-hidden"
            style={{
              clipPath: reducedMotion
                ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
                : 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
            }}
          >
            {/* Decorative gold border accent */}
            <div
              className="absolute inset-0 z-10 pointer-events-none border-2 border-gold m-3"
            />
            <Image
              src="/images/about/about-hero.png"
              alt="Snug&Knot founder in the studio"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Bottom gradient overlay */}
            <div
              className="absolute inset-x-0 bottom-0 h-1/3 z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(to top, rgba(61,10,14,0.3), transparent)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────
   2 · STATS BAND
   Full-width burgundy bg, gold stat numbers
   ────────────────────────────────────────────────────────── */

function StatsBand({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section
      className="relative py-20 lg:py-24 overflow-hidden bg-burgundy"
    >
      {/* Subtle knit-pattern overlay */}
      <div className="knit-pattern-gold absolute inset-0" />

      {/* Decorative top/bottom gold lines */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gold/25"
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-gold/25"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <div className="text-center">
                <StatCounter
                  value={stat.value}
                  suffix={stat.suffix}
                  reducedMotion={reducedMotion}
                />
                {/* Thin gold separator */}
                <div
                  className="w-8 h-px mx-auto mt-4 mb-3 bg-gold/50"
                />
                <p
                  className="text-sm font-medium tracking-wider uppercase text-gold-muted"
                >
                  {stat.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────
   3 · VALUES GRID
   2-col staggered masonry, cards lift on hover with
   directional shadow
   ────────────────────────────────────────────────────────── */

function ValuesGrid({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <section className="py-24 lg:py-32 bg-ivory">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="text-xs font-semibold text-gold-muted uppercase tracking-[0.3em] mb-4">
            Our Principles
          </p>
          <TextReveal
            as="h2"
            className="text-4xl sm:text-5xl lg:text-6xl text-burgundy mb-4"
          >
            What We Believe
          </TextReveal>
          <FadeIn delay={0.15}>
            <p className="text-wine/70 max-w-xl mx-auto mt-4 leading-relaxed">
              Four guiding threads that weave through everything we create.
            </p>
          </FadeIn>
        </div>

        {/* 2-col staggered masonry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {values.map((value, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <ValueCard
                value={value}
                index={i}
                reducedMotion={reducedMotion}
              />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

function ValueCard({
  value,
  index,
  reducedMotion,
}: {
  value: (typeof values)[number]
  index: number
  reducedMotion: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reducedMotion || !cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      // Directional shadow: shadow moves opposite to cursor
      const shadowX = -(x / rect.width) * 16
      const shadowY = -(y / rect.height) * 16
      cardRef.current.style.boxShadow = `${shadowX}px ${shadowY}px 40px -12px rgba(91,14,20,0.15)`
      cardRef.current.style.transform = 'translateY(-6px)'
    },
    [reducedMotion]
  )

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return
    cardRef.current.style.boxShadow = '0 1px 4px 0 rgba(91,14,20,0.06)'
    cardRef.current.style.transform = 'translateY(0px)'
  }, [])

  // Staggered masonry: odd indices get top margin on larger screens
  const staggerOffset = index % 2 === 1 ? 'sm:mt-12' : ''

  return (
    <div
      ref={cardRef}
      className={`group relative p-8 lg:p-10 transition-all duration-500 ease-[var(--ease-yarn-pull)] cursor-default bg-ivory border border-gold-muted/25 ${staggerOffset}`}
      style={{
        boxShadow: '0 1px 4px 0 rgba(91,14,20,0.06)',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top-left accent line */}
      <div
        className="absolute top-0 left-0 w-12 h-0.5 transition-all duration-500 group-hover:w-20 bg-gold"
      />
      <div
        className="absolute top-0 left-0 w-0.5 h-12 transition-all duration-500 group-hover:h-20 bg-gold"
      />

      {/* Icon */}
      <div
        className="w-12 h-12 flex items-center justify-center mb-6 transition-colors duration-300 text-burgundy"
      >
        {value.icon}
      </div>

      {/* Number watermark */}
      <span
        className="absolute top-4 right-6 font-heading text-7xl font-bold select-none pointer-events-none text-gold/15"
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <h3
        className="font-heading text-xl lg:text-2xl mb-3 text-burgundy"
      >
        {value.title}
      </h3>
      <p
        className="text-sm leading-relaxed text-wine"
      >
        {value.description}
      </p>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
   4 · TIMELINE
   Vertical gold thread line with year nodes
   Thread scaleY 0->1 via ScrollTrigger scrub
   ────────────────────────────────────────────────────────── */

function TimelineSection({ reducedMotion }: { reducedMotion: boolean }) {
  const threadRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (reducedMotion) return

    const triggers: ScrollTrigger[] = []

    // Thread scaleY: 0 -> 1 as user scrolls through the section
    if (threadRef.current && sectionRef.current) {
      const tween = gsap.fromTo(
        threadRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            end: 'bottom 40%',
            scrub: 0.8,
          },
        }
      )
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger)
    }

    // Year nodes: scale in as they hit the viewport
    nodeRefs.current.forEach((node) => {
      if (!node) return
      const tween = gsap.fromTo(
        node,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: node,
            start: 'top 82%',
            once: true,
          },
        }
      )
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger)
    })

    return () => {
      triggers.forEach((t) => t.kill())
    }
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-parchment"
    >
      {/* Decorative top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-gold-muted/40"
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <p className="text-xs font-semibold text-gold-muted uppercase tracking-[0.3em] mb-4">
            Milestones
          </p>
          <TextReveal
            as="h2"
            className="text-4xl sm:text-5xl lg:text-6xl text-burgundy"
          >
            Our Journey
          </TextReveal>
        </div>

        {/* Timeline container */}
        <div className="relative max-w-3xl mx-auto">
          {/* Gold thread — vertical line */}
          <div
            ref={threadRef}
            className="absolute left-6 sm:left-8 top-0 bottom-0 w-px origin-top bg-gold"
            style={{
              transform: reducedMotion ? 'scaleY(1)' : 'scaleY(0)',
            }}
          />

          {/* Timeline items */}
          <div className="space-y-12 lg:space-y-16">
            {timeline.map((item, i) => (
              <div key={i} className="relative flex gap-8 sm:gap-12 items-start">
                {/* Year node */}
                <div
                  ref={(el) => { nodeRefs.current[i] = el }}
                  className="relative z-10 shrink-0 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-burgundy border-2 border-gold"
                  style={{
                    opacity: reducedMotion ? 1 : 0,
                    transform: reducedMotion ? 'scale(1)' : 'scale(0)',
                  }}
                >
                  <span
                    className="font-mono text-xs sm:text-sm font-bold text-gold"
                  >
                    {item.year}
                  </span>
                </div>

                {/* Event text card */}
                <FadeIn delay={i * 0.08}>
                  <div
                    className="flex-1 pt-2 sm:pt-3 pb-4 pl-6 transition-colors duration-300 border-l-2 border-transparent hover:border-gold"
                  >
                    <p
                      className="font-heading text-lg sm:text-xl mb-1 text-burgundy"
                    >
                      {item.year}
                    </p>
                    <p
                      className="leading-relaxed text-wine"
                    >
                      {item.event}
                    </p>
                  </div>
                </FadeIn>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────
   5 · CLOSING CTA
   ────────────────────────────────────────────────────────── */

function ClosingCTA() {
  return (
    <section
      className="relative py-24 lg:py-32 text-center overflow-hidden bg-burgundy-deep"
    >
      {/* Decorative knit pattern */}
      <div className="knit-pattern-gold absolute inset-0" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] mb-4 text-gold-muted"
          >
            Join the Story
          </p>
        </FadeIn>
        <TextReveal
          as="h2"
          className="text-3xl sm:text-4xl lg:text-5xl mb-6"
          // gold heading on dark bg
        >
          Every Knot Tells a Story
        </TextReveal>
        <FadeIn delay={0.2}>
          <p
            className="leading-relaxed mb-10 max-w-lg mx-auto text-silk"
          >
            We are still weaving our story, and we would love for you to be
            part of it. Discover pieces crafted with care, designed to endure.
          </p>
          <Link
            href="/collections"
            className="inline-flex items-center gap-3 px-8 py-4 text-sm font-semibold tracking-wider uppercase transition-all duration-300 bg-gold text-burgundy-deep hover:bg-gold-pale hover:shadow-[0_8px_32px_-8px_rgba(241,225,148,0.4)]"
          >
            Shop the Collection
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </FadeIn>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────
   PHILOSOPHY SECTION — Three pillars from BrandPhilosophy
   ────────────────────────────────────────────────────────── */

const pillars = [
  {
    number: '01',
    title: 'Material over material',
    subtitle: 'Substance First',
    description:
      'We do not choose fibers for their name. We choose them for their nerve — the way they resist, yield, and remember the shape of a life lived fully.',
    stat: { value: '100%', label: 'Natural Fibers' },
  },
  {
    number: '02',
    title: 'The knot, not the bow',
    subtitle: 'Function Before Ornament',
    description:
      'A bow is decoration. A knot is decision. Every seam, every stitch placement exists because removing it would make the piece less. Nothing is ornamental.',
    stat: { value: '47', label: 'Stitch Points per Inch' },
  },
  {
    number: '03',
    title: 'Wear is not damage',
    subtitle: 'Time as Collaborator',
    description:
      'A garment that cannot age was never alive. Our textiles are designed to develop patina — to become more yours with every wearing, not less ours.',
    stat: { value: '∞', label: 'Wears by Design' },
  },
]

function PhilosophySection() {
  return (
    <section
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #5B0E14 0%, #3D0A0E 40%, #0F0A0B 100%)',
      }}
    >
      <div className="absolute inset-0 knit-pattern-gold" />

      <div className="relative max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="mb-16">
          <p className="text-xs font-semibold text-gold-muted uppercase tracking-[0.3em] mb-4">
            Philosophy
          </p>
          <TextReveal
            as="h2"
            className="text-4xl sm:text-5xl lg:text-6xl text-gold-pale max-w-[800px]"
          >
            Three knots that hold everything together
          </TextReveal>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar, i) => (
            <FadeIn key={pillar.number} delay={i * 0.1}>
              <div
                className={`group relative ${i === 1 ? 'lg:mt-[60px]' : i === 2 ? 'lg:mt-[120px]' : ''}`}
              >
                <div
                  className="relative rounded-2xl p-8 lg:p-10 border border-gold/[0.05] transition-all duration-500 group-hover:border-gold/20 group-hover:translate-y-[-4px]"
                  style={{
                    background: 'rgba(241, 225, 148, 0.03)',
                    boxShadow: 'inset 0 1px 0 rgba(241, 225, 148, 0.06)',
                  }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span
                      className="font-mono text-[48px] lg:text-[64px] font-bold leading-none text-gold/20"
                    >
                      {pillar.number}
                    </span>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-gold/20 to-transparent" />
                  </div>

                  <span className="inline-block mb-3 font-mono text-[10px] tracking-[0.4em] uppercase text-gold">
                    {pillar.subtitle}
                  </span>

                  <h3 className="font-heading text-2xl lg:text-3xl text-gold-pale mb-4 leading-tight">
                    {pillar.title}
                  </h3>

                  <p className="text-gold-pale/60 text-sm leading-relaxed mb-8">
                    {pillar.description}
                  </p>

                  <div className="flex items-end gap-3 pt-6 border-t border-gold/[0.06]">
                    <span className="font-heading text-3xl font-bold text-gold">
                      {pillar.stat.value}
                    </span>
                    <span className="font-mono text-[10px] text-gold-pale/40 tracking-wider uppercase pb-1">
                      {pillar.stat.label}
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="font-heading text-gold-pale/40 italic text-lg">
            &ldquo;What frays was never truly bound.&rdquo;
          </p>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────
   STAT COUNTER — animated number with GSAP ScrollTrigger
   ────────────────────────────────────────────────────────── */

function StatCounter({
  value,
  suffix,
  reducedMotion,
}: {
  value: number
  suffix: string
  reducedMotion: boolean
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (reducedMotion || !ref.current) return

    const el = ref.current
    const counter = { value: 0 }

    const tween = gsap.to(counter, {
      value,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        once: true,
      },
      onUpdate: () => {
        el.textContent = `${Math.round(counter.value)}${suffix}`
      },
    })

    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [value, suffix, reducedMotion])

  return (
    <span
      ref={ref}
      className="font-heading text-4xl lg:text-6xl font-bold text-gold"
    >
      {reducedMotion ? `${value}${suffix}` : `0${suffix}`}
    </span>
  )
}
