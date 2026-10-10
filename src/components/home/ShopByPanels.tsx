'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'motion/react'
import { useNavData } from '@/components/providers/SettingsProvider'
import { Arrow } from '@/components/kit/Button'
import { cn } from '@/lib/format'

const PANELS = [
  { id: 'women', title: 'Women', href: '/shop/women', image: '/images/products/women/ivory-cable-cardigan-1.jpg', note: 'Cardigans with heirloom stitches' },
  { id: 'men', title: 'Men', href: '/shop/men', image: '/images/products/men/black-red-contrast-tee-1.jpg', note: 'Fine-gauge knit tees' },
] as const

/** Two tall panels; the hovered one widens and its photograph comes forward. */
export default function ShopByPanels() {
  const nav = useNavData()
  const [hover, setHover] = useState<string | null>(null)

  return (
    <section className="section-pad bg-ivory text-ink" aria-label="Shop by">
      <div className="container-wide">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="text-headline">
            Find your <em className="text-burgundy">knit</em>
          </h2>
          <p className="max-w-xs text-sm text-stone">Two wardrobes, one standard: natural fibres, honest construction and a finish you can feel.</p>
        </div>
        <div className="mt-12 flex h-[clamp(520px,78vh,860px)] flex-col gap-4 md:flex-row">
          {PANELS.map((p) => {
            const count = nav.genders[p.id]
            const grow = hover === null ? 1 : hover === p.id ? 1.55 : 0.75
            return (
              <motion.div
                key={p.id}
                animate={{ flexGrow: grow }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="relative min-h-0 flex-1 basis-0 overflow-hidden rounded-[1.75rem]"
                onMouseEnter={() => setHover(p.id)}
                onMouseLeave={() => setHover(null)}
              >
                <Link href={p.href} className="group absolute inset-0 block" data-cursor="view" data-cursor-label="Shop">
                  <Image src={p.image} alt={`${p.title}'s knitwear`} fill sizes="(min-width:768px) 60vw, 100vw" className={cn('object-cover object-top transition-transform duration-[1.6s] ease-[cubic-bezier(.16,1,.3,1)]', hover === p.id ? 'scale-[1.04]' : 'scale-[1.12]')} />
                  <div className="absolute inset-0 bg-gradient-to-t from-noir/75 via-noir/10 to-transparent" />
                  <div className="absolute inset-x-6 bottom-6 flex items-end justify-between gap-4 text-bone md:inset-x-9 md:bottom-9">
                    <div>
                      <p className="text-eyebrow text-gold-light">{count ? `${count} piece${count === 1 ? '' : 's'}` : 'Coming soon'}</p>
                      <p className="mt-2 font-display text-[clamp(3.5rem,8vw,8rem)] leading-[0.85] tracking-[-0.03em]">{p.title}</p>
                      <p className={cn('mt-3 max-w-xs text-sm text-bone/70 transition-all duration-700', hover === p.id ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0 md:opacity-0')}>{p.note}</p>
                    </div>
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bone text-ink transition-transform duration-700 group-hover:rotate-45">
                      <Arrow className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
        <p className="mt-6 text-center text-sm text-stone">
          Little ones next.{' '}
          <Link href="/shop/kids" className="link-wipe text-ink">
            The kids&rsquo; atelier
          </Link>{' '}
          is in the works.
        </p>
      </div>
    </section>
  )
}
