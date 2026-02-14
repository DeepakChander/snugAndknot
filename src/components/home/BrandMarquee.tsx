'use client'

import Marquee from '@/components/animation/Marquee'
import { getSiteConfig } from '@/lib/data'

export default function BrandMarquee() {
  const config = getSiteConfig()

  return (
    <section className="relative py-6 bg-charcoal border-y border-cream/[0.06] overflow-hidden">
      {/* Top subtle glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-terracotta/20 to-transparent" />

      <Marquee speed={35} className="py-2">
        {config.brandValues.map((value, i) => (
          <span key={i} className="flex items-center gap-8 mx-8">
            <span className="text-[11px] font-medium text-cream/70 uppercase tracking-[0.25em] whitespace-nowrap hover:text-cream transition-colors duration-500 cursor-default">
              {value}
            </span>
            {/* Diamond separator */}
            <span className="text-terracotta/60 text-[8px]">&#9670;</span>
          </span>
        ))}
      </Marquee>

      {/* Bottom subtle glow */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-terracotta/20 to-transparent" />
    </section>
  )
}
