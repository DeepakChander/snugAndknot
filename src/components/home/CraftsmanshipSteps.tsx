'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import TextReveal from '@/components/animation/TextReveal'

const steps = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <path d="M2 12h4M18 12h4" strokeLinecap="round" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
        <circle cx="15" cy="9" r="1" fill="currentColor" />
      </svg>
    ),
    title: 'Source',
    description:
      'We hand-select the finest natural fibers from ethical suppliers worldwide — premium merino wool, organic cotton, and sustainable cashmere blends.',
    accent: false,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M12 19l7-7 3 3-7 7-3-3z" />
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        <path d="M2 2l7.586 7.586" />
        <circle cx="11" cy="11" r="2" />
      </svg>
    ),
    title: 'Design',
    description:
      'Our artisans sketch each piece by hand, blending timeless silhouettes with modern sensibility. Every stitch placement and seam line is intentional.',
    accent: false,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: 'Craft',
    description:
      'Small-batch production in our partner ateliers. Each garment is knitted, cut, and finished by skilled hands with meticulous attention to detail.',
    accent: false,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M16 3.13a4 4 0 010 7.75" />
        <path d="M21 21v-2a4 4 0 00-3-3.87" />
      </svg>
    ),
    title: 'Deliver',
    description:
      'Wrapped in our signature packaging, your piece arrives ready to become part of your story. Built to last, designed to be cherished for years.',
    accent: true,
  },
]

function CornerBorders({ accent }: { accent: boolean }) {
  const color = accent ? 'bg-terracotta/30' : 'bg-cream/10'

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top-left */}
      <div className="absolute top-0 left-0">
        <div className={`absolute top-0 left-0 w-8 h-[1px] ${color}`} />
        <div className={`absolute top-0 left-0 h-8 w-[1px] ${color}`} />
      </div>
      {/* Top-right */}
      <div className="absolute top-0 right-0">
        <div className={`absolute top-0 right-0 w-8 h-[1px] ${color}`} />
        <div className={`absolute top-0 right-0 h-8 w-[1px] ${color}`} />
      </div>
      {/* Bottom-right */}
      <div className="absolute bottom-0 right-0">
        <div className={`absolute bottom-0 right-0 w-8 h-[1px] ${color}`} />
        <div className={`absolute bottom-0 right-0 h-8 w-[1px] ${color}`} />
      </div>
      {/* Bottom-left */}
      <div className="absolute bottom-0 left-0">
        <div className={`absolute bottom-0 left-0 w-8 h-[1px] ${color}`} />
        <div className={`absolute bottom-0 left-0 h-8 w-[1px] ${color}`} />
      </div>
    </div>
  )
}

export default function CraftsmanshipSteps() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' })

  return (
    <section
      ref={sectionRef}
      className="relative py-28 lg:py-40 bg-charcoal overflow-hidden"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-terracotta/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-16 lg:mb-24 text-center max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-xs font-semibold uppercase tracking-[0.3em] mb-5 text-terracotta"
          >
            Our Craft
          </motion.p>

          <h2 className="font-heading text-4xl sm:text-5xl lg:text-7xl text-cream mb-6">
            <TextReveal>From Fiber to Fashion</TextReveal>
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-base sm:text-lg text-cream/60 leading-relaxed"
          >
            Every Snug&Knot garment is a journey — from ethically sourced fibers
            to the moment it becomes part of your wardrobe. Here&apos;s how we
            bring our vision to life.
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.3 + i * 0.15,
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="group relative"
            >
              <div
                className={`relative rounded-2xl p-8 lg:p-10 h-full transition-all duration-500 border ${
                  step.accent
                    ? 'border-terracotta/10 bg-terracotta/[0.03] hover:bg-terracotta/[0.06] hover:border-terracotta/20'
                    : 'border-cream/[0.03] bg-cream/[0.02] hover:bg-cream/[0.04] hover:border-cream/10'
                }`}
              >
                {/* Corner borders */}
                <CornerBorders accent={step.accent} />

                {/* Inner content background */}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-8 transition-colors duration-500 ${
                    step.accent
                      ? 'bg-terracotta/10 text-terracotta group-hover:bg-terracotta/20'
                      : 'bg-cream/5 text-cream group-hover:bg-cream/10'
                  }`}
                >
                  {step.icon}
                </div>

                {/* Title */}
                <h3
                  className={`font-heading text-2xl lg:text-3xl mb-4 transition-colors duration-300 ${
                    step.accent ? 'text-terracotta' : 'text-cream'
                  }`}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  className={`text-sm leading-relaxed ${
                    step.accent ? 'text-terracotta/60' : 'text-cream/50'
                  }`}
                >
                  {step.description}
                </p>

                {/* Step number */}
                <div
                  className={`absolute top-6 right-6 font-mono text-xs ${
                    step.accent ? 'text-terracotta/20' : 'text-cream/10'
                  }`}
                >
                  0{i + 1}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16 lg:mt-24 text-center"
        >
          <p className="text-sm text-cream/30 uppercase tracking-[0.25em]">
            Ethically sourced &bull; Handcrafted with care &bull; Built to last
          </p>
        </motion.div>
      </div>
    </section>
  )
}
