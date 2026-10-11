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
    <section data-nav-theme="light" className="section-pad bg-clay text-ink" aria-label="Customer reviews">
      <div className="container-wide grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="text-eyebrow slash text-ink/70">In their words</p>
          <p className="mt-6 font-display text-[clamp(5.5rem,12vw,11rem)] font-semibold leading-[0.8] tracking-[-0.07em]">{average.toFixed(1)}</p>
          <Stars value={average} size={20} />
          <p className="mt-3 text-sm text-ink/70">
            From {count} review{count === 1 ? '' : 's'} by our clients.
          </p>
          {reviews.length > 1 ? (
            <div className="mt-8 flex gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Previous review" data-cursor="hover" className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/25 transition-colors hover:bg-ink hover:text-bone">
                <ArrowLeft size={18} />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next review" data-cursor="hover" className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/25 transition-colors hover:bg-ink hover:text-bone">
                <ArrowRight size={18} />
              </button>
            </div>
          ) : null}
        </div>
        <div className="relative min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.figure key={r.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
              <Stars value={r.rating} size={16} />
              <blockquote className="mt-6 font-display text-[clamp(1.9rem,3.4vw,3.3rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
                <p>&ldquo;{r.title}.&rdquo;</p>
                <p className="mt-5 font-sans text-lead font-normal tracking-normal text-ink/75">{r.body}</p>
              </blockquote>
              <figcaption className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="font-medium">{r.author}</span>
                {r.verified ? <span className="rounded-full bg-ink px-2.5 py-1 text-label text-bone">Verified buyer</span> : null}
                <span className="text-ink/80">on</span>
                <Link href={`/product/${r.productHandle}`} className="link-wipe font-medium">
                  {r.productTitle}
                </Link>
                <span className="text-ink/80">· {formatDate(r.createdAt)}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
