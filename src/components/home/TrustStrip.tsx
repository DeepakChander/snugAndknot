'use client'

import FadeIn from '@/components/animation/FadeIn'

const trustItems = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    label: 'Free Shipping',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
        <path d="M7 2.2C6 4.7 6 8 6 8s3.3 0 5.8-1" strokeLinecap="round" />
        <path d="M17 2.2c1 2.5 1 5.8 1 5.8s-3.3 0-5.8-1" strokeLinecap="round" />
      </svg>
    ),
    label: '100% Natural Fibers',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    label: 'Lifetime Guarantee',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
        <path d="M12 3v1m0 16v1m-8-9H3m18 0h-1M5.6 5.6l.7.7m12.1 12.1l.7.7M5.6 18.4l.7-.7M18.4 5.6l.7-.7" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    label: 'Carbon Neutral',
  },
]

export default function TrustStrip() {
  return (
    <section className="relative py-5 bg-burgundy overflow-hidden">
      {/* Top/bottom gold borders */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

      {/* Knit pattern overlay */}
      <div className="absolute inset-0 knit-pattern-gold" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          {/* Desktop: horizontal flex row */}
          <div className="hidden sm:flex items-center justify-center gap-0">
            {trustItems.map((item, i) => (
              <div key={item.label} className="flex items-center">
                <div className="flex items-center gap-2.5 px-6">
                  <span className="text-gold">{item.icon}</span>
                  <span className="text-[11px] font-medium text-gold-pale/80 uppercase tracking-[0.15em] whitespace-nowrap">
                    {item.label}
                  </span>
                </div>
                {i < trustItems.length - 1 && (
                  <span className="text-gold/30 text-xs select-none">|</span>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: 2x2 grid */}
          <div className="sm:hidden grid grid-cols-2 gap-4">
            {trustItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 justify-center">
                <span className="text-gold">{item.icon}</span>
                <span className="text-[10px] font-medium text-gold-pale/80 uppercase tracking-[0.1em]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
