'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Stars } from '@/components/kit/Stars'
import { ArrowLeft, ArrowRight } from '@/components/kit/icons'
import { formatDate } from '@/lib/format'

export interface HomeReview {
  id: string
  author: string
  rating: number
  title: string
  body: string
  verified: boolean
  createdAt: string
  productTitle: string
  productHandle: string
}

/** Real, approved customer reviews only — the section does not render without them. */
export default function ClientReviews({ reviews, average, count }: { reviews: HomeReview[]; average: number; count: number }) {
  const [i, setI] = useState(0)
  if (!reviews.length) return null
  const r = reviews[i]
  const go = (d: number) => setI((n) => (n + d + reviews.length) % reviews.length)

  return (
    <section className="section-pad bg-bone text-ink" aria-label="Customer reviews">
      <div className="container-wide grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="text-eyebrow text-burgundy">In their words</p>
          <p className="mt-6 font-display text-[clamp(5rem,10vw,9rem)] leading-none tracking-[-0.04em]">{average.toFixed(1)}</p>
          <Stars value={average} size={20} />
          <p className="mt-3 text-sm text-stone">
            From {count} verified review{count === 1 ? '' : 's'} by our clients.
          </p>
          {reviews.length > 1 ? (
            <div className="mt-8 flex gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Previous review" data-cursor="hover" className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/15 hover:bg-ink hover:text-ivory">
                <ArrowLeft size={18} />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next review" data-cursor="hover" className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/15 hover:bg-ink hover:text-ivory">
                <ArrowRight size={18} />
              </button>
            </div>
          ) : null}
        </div>
        <div className="relative min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.figure key={r.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
              <Stars value={r.rating} size={16} />
              <blockquote className="mt-6 font-display text-[clamp(1.9rem,3.4vw,3.2rem)] leading-[1.08] tracking-[-0.015em]">
                <p>&ldquo;{r.title}.&rdquo;</p>
                <p className="mt-4 font-sans text-lead text-stone">{r.body}</p>
              </blockquote>
              <figcaption className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="font-medium">{r.author}</span>
                {r.verified ? <span className="text-label text-success">Verified buyer</span> : null}
                <span className="text-stone">on</span>
                <Link href={`/product/${r.productHandle}`} className="link-wipe text-burgundy">
                  {r.productTitle}
                </Link>
                <span className="text-stone">· {formatDate(r.createdAt)}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
