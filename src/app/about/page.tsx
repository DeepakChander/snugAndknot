'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { value: 142, suffix: '+', label: 'Artisan Partners' },
  { value: 35, suffix: 'K+', label: 'Happy Customers' },
  { value: 98, suffix: '%', label: 'Sustainable Materials' },
  { value: 12, suffix: '', label: 'Countries Shipped' },
]

const values = [
  { title: 'Thoughtfully Designed', description: 'Every piece begins with intention. We design for real life, creating garments that move with you from morning to evening.' },
  { title: 'Sustainably Sourced', description: 'We partner with responsible mills and suppliers to ensure our materials meet the highest environmental standards.' },
  { title: 'Crafted with Care', description: 'Our artisan partners bring decades of expertise to every stitch, ensuring each garment meets our exacting quality standards.' },
  { title: 'Made to Last', description: 'We believe in buying less but better. Our pieces are designed to endure, both in construction and in style.' },
]

export default function AboutPage() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="pt-24 pb-20">
      {/* Hero */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold text-terracotta uppercase tracking-[0.3em] mb-3">Our Story</p>
            <TextReveal as="h1" className="text-5xl sm:text-6xl lg:text-7xl text-charcoal mb-6">
              Woven with Intention
            </TextReveal>
            <FadeIn delay={0.2}>
              <p className="text-walnut text-lg leading-relaxed mb-6">
                Snug&Knot was born from a simple belief: that the clothes we wear should feel
                as good as they look. Founded in 2020, we set out to create a fashion brand that
                honors craft, celebrates simplicity, and respects the world we live in.
              </p>
              <p className="text-walnut leading-relaxed">
                Every piece in our collection is thoughtfully designed to be versatile, enduring,
                and effortlessly elegant. We work with artisan partners around the world who share
                our commitment to quality and sustainability.
              </p>
            </FadeIn>
          </div>
          <FadeIn delay={0.3}>
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-cream-dark">
              <Image
                src="/images/about/about-hero.jpg"
                alt="Snug&Knot founder in the studio"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats with animated counters */}
      <section className="bg-cream-dark py-16 lg:py-20 mb-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div>
                  <StatCounter value={stat.value} suffix={stat.suffix} reducedMotion={reducedMotion} />
                  <p className="text-sm text-earth mt-2">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center mb-12">
          <TextReveal as="h2" className="text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-4">
            What We Believe
          </TextReveal>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-blush flex items-center justify-center">
                  <span className="font-heading text-xl text-terracotta">{i + 1}</span>
                </div>
                <h3 className="font-heading text-xl text-charcoal mb-3">{value.title}</h3>
                <p className="text-sm text-walnut leading-relaxed">{value.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Brand story timeline */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <FadeIn>
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-cream-dark">
              <Image
                src="/images/about/workshop.jpg"
                alt="Snug&Knot workshop"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </FadeIn>
          <div className="flex flex-col justify-center">
            <TextReveal as="h2" className="text-4xl sm:text-5xl text-charcoal mb-8">
              Our Journey
            </TextReveal>
            <div className="space-y-8">
              {[
                { year: '2020', event: 'Founded with a small collection of 12 essential pieces.' },
                { year: '2021', event: 'Expanded to 5 categories. Launched sustainable packaging initiative.' },
                { year: '2022', event: 'Opened our flagship studio in SoHo, New York.' },
                { year: '2023', event: 'Reached 25,000 customers worldwide. Partnered with 100+ artisans.' },
                { year: '2024', event: 'Launched our certified carbon-neutral shipping program.' },
                { year: '2025', event: 'Introduced our AW25 collection, our most ambitious yet.' },
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="flex gap-6">
                    <span className="font-mono text-sm text-terracotta font-semibold shrink-0 w-12">{item.year}</span>
                    <p className="text-walnut leading-relaxed">{item.event}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCounter({ value, suffix, reducedMotion }: { value: number; suffix: string; reducedMotion: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (reducedMotion || !ref.current) return

    const el = ref.current
    const counter = { value: 0 }

    gsap.to(counter, {
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

    // Set initial
    el.textContent = `0${suffix}`

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill()
      })
    }
  }, [value, suffix, reducedMotion])

  return (
    <span ref={ref} className="font-heading text-4xl lg:text-5xl text-charcoal">
      {value}{suffix}
    </span>
  )
}
