'use client'

import Marquee from '@/components/motion/Marquee'

const WORDS = ['Merino wool', 'Cashmere blend', 'Long-staple cotton', 'Hand-finished', 'Small batches', 'Natural buttons']

export default function MaterialsMarquee() {
  return (
    <section aria-label="Materials" className="relative overflow-hidden border-y border-ink/10 bg-ivory py-7 text-ink md:py-9">
      <Marquee speed={1.1}>
        {WORDS.map((w, i) => (
          <span key={w} className="flex items-center">
            <span className={`whitespace-nowrap px-6 font-display text-[clamp(2.4rem,5.5vw,5rem)] leading-none tracking-[-0.02em] ${i % 2 ? 'italic text-burgundy' : ''}`}>{w}</span>
            <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-gold md:h-8 md:w-8" aria-hidden>
              <path d="M12 2c1 4.5 3.5 7 8 8-4.5 1-7 3.5-8 8-1-4.5-3.5-7-8-8 4.5-1 7-3.5 8-8z" fill="currentColor" />
            </svg>
          </span>
        ))}
      </Marquee>
    </section>
  )
}
