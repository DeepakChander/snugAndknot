'use client'

import Marquee from '@/components/animation/Marquee'
import { getSiteConfig } from '@/lib/data'

export default function BrandMarquee() {
  const config = getSiteConfig()

  return (
    <section className="relative py-5 bg-noir border-y border-gold/[0.06] overflow-hidden">
      {/* Top gold thread */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      {/* Forward direction */}
      <Marquee speed={35} className="py-1">
        {config.brandValues.map((value, i) => (
          <span key={i} className="flex items-center gap-8 mx-8">
            <span className="text-[11px] font-medium text-gold-pale/70 uppercase tracking-[0.25em] whitespace-nowrap hover:text-gold transition-colors duration-500 cursor-default">
              {value}
            </span>
            <span className="text-gold/60 text-[8px]">&#9670;</span>
          </span>
        ))}
      </Marquee>

      {/* Divider */}
      <div className="h-[1px] bg-gold-pale/5 mx-auto my-1" />

      {/* Reverse direction (slower, more subtle) */}
      <div className="opacity-25">
        <Marquee speed={24} direction="right" className="py-1">
          {config.brandValues.map((value, i) => (
            <span key={i} className="flex items-center gap-8 mx-8">
              <span className="text-[11px] font-medium text-gold uppercase tracking-[0.25em] whitespace-nowrap cursor-default">
                {value}
              </span>
              <span className="text-gold/60 text-[8px]">&#9670;</span>
            </span>
          ))}
        </Marquee>
      </div>

      {/* Bottom gold thread */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
    </section>
  )
}
