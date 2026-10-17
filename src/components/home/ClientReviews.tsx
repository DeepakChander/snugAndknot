import Link from 'next/link'
import { Stars } from '@/components/kit/Stars'
import { formatDate } from '@/lib/format'
import { SOURCE_LABEL } from '@/lib/review-source'
import type { ReviewSource } from '@/types/commerce'

export interface HomeReview {
  id: string
  author: string
  rating: number
  title: string
  body: string
  verified: boolean
  source?: ReviewSource
  createdAt: string
  productTitle: string
  productHandle: string
}

/**
 * Customer reviews: the average and count, then the latest reviews as cards side by side (a row you
 * swipe on a phone). Real, approved reviews only; the section does not render without them.
 */
export default function ClientReviews({ reviews, average, count }: { reviews: HomeReview[]; average: number; count: number }) {
  if (!reviews.length) return null
  return (
    <section aria-labelledby="reviews-title" className="bg-ivory py-[clamp(3.5rem,7vw,6rem)] text-ink">
      <div className="container-wide">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-eyebrow text-stone">Reviews</p>
            <h2 id="reviews-title" className="mt-3 text-headline">
              What customers <em>say</em>
            </h2>
          </div>
          <p className="flex items-center gap-2 text-[0.86rem]">
            <Stars value={average} size={14} />
            <span className="font-medium">{average.toFixed(1)}</span>
            <span className="text-stone">
              from {count} review{count === 1 ? '' : 's'}
            </span>
          </p>
        </div>
        <ul className="no-scrollbar -mx-[var(--gutter)] mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-gutter md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0">
          {reviews.slice(0, 3).map((r) => (
            <li key={r.id} className="flex w-[82vw] shrink-0 snap-start flex-col border border-ink/10 p-6 sm:w-[60vw] md:w-auto">
              <Stars value={r.rating} size={13} />
              {r.title ? <p className="mt-4 text-[1rem] font-medium leading-snug">{r.title}</p> : null}
              <p className="mt-2 line-clamp-5 flex-1 text-[0.9rem] leading-relaxed text-ink/75">{r.body}</p>
              <p className="mt-5 text-[0.78rem] text-stone">
                <span className="font-medium text-ink">{r.author}</span>
                {r.verified ? ' · Verified buyer' : r.source && r.source !== 'site' ? ` · Shared ${SOURCE_LABEL[r.source]}` : ''} · {formatDate(r.createdAt)}
              </p>
              <Link href={`/product/${r.productHandle}`} className="mt-1 block truncate text-[0.78rem] underline underline-offset-4 hover:text-ink/70">
                {r.productTitle}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
