'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/kit/Button'
import { Field, TextArea } from '@/components/kit/Field'
import { StarInput, Stars } from '@/components/kit/Stars'
import Overlay, { CloseButton } from '@/components/kit/Overlay'
import { FitMeter } from './ProductInfo'
import { api, ApiError } from '@/lib/api'
import { useSettings } from '@/components/providers/SettingsProvider'
import { cn, formatDate } from '@/lib/format'
import type { RatingSummary, Review, ReviewFit } from '@/types/commerce'

type SortKey = 'newest' | 'highest' | 'lowest' | 'helpful'

export default function Reviews({
  handle,
  productTitle,
  initialReviews,
  initialSummary,
}: {
  handle: string
  productTitle: string
  initialReviews: Review[]
  initialSummary: RatingSummary
}) {
  const user = useAuthStore((s) => s.user)
  const openAuthModal = useAuthStore((s) => s.openAuthModal)
  const [reviews, setReviews] = useState(initialReviews)
  const [summary, setSummary] = useState(initialSummary)
  const [mine, setMine] = useState<Review | null>(null)
  const [writing, setWriting] = useState(false)
  const [sort, setSort] = useState<SortKey>('newest')
  const [filter, setFilter] = useState<number | null>(null)
  const [shown, setShown] = useState(6)
  const [helped, setHelped] = useState<Set<string>>(new Set())

  // Fresh data (and the visitor's own review) once we know who they are.
  useEffect(() => {
    let alive = true
    api<{ reviews: Review[]; summary: RatingSummary; mine: Review | null }>(`/api/products/${handle}/reviews`)
      .then((d) => {
        if (!alive) return
        setReviews(d.reviews)
        setSummary(d.summary)
        setMine(d.mine)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [handle, user?.id])

  const start = () => {
    if (user) setWriting(true)
    else openAuthModal('login', () => setWriting(true))
  }

  const list = reviews
    .filter((r) => (filter ? r.rating === filter : true))
    .sort((a, b) =>
      sort === 'highest' ? b.rating - a.rating : sort === 'lowest' ? a.rating - b.rating : sort === 'helpful' ? b.helpful - a.helpful : +new Date(b.createdAt) - +new Date(a.createdAt)
    )

  async function markHelpful(id: string) {
    if (helped.has(id)) return
    setHelped(new Set(helped).add(id))
    try {
      const { helpful } = await api<{ helpful: number }>(`/api/reviews/${id}/helpful`, { method: 'POST' })
      setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, helpful } : r)))
    } catch {}
  }

  return (
    <section id="reviews" className="scroll-mt-28 border-t border-ink/10 bg-ivory py-20 text-ink md:py-28" aria-label="Reviews">
      <div className="container-wide grid gap-14 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-20">
        <aside className="lg:sticky lg:top-[calc(var(--nav-offset)+2rem)] lg:self-start">
          <p className="text-eyebrow text-burgundy">Reviews</p>
          {summary.count ? (
            <>
              <p className="mt-5 text-[3rem] font-medium leading-none">{summary.average.toFixed(1)}</p>
              <Stars value={summary.average} size={18} />
              <p className="mt-2 text-sm text-stone">
                Based on {summary.count} review{summary.count === 1 ? '' : 's'}
              </p>
              <ul className="mt-8 space-y-2">
                {[5, 4, 3, 2, 1].map((n) => {
                  const c = summary.distribution[n - 1]
                  const pct = summary.count ? (c / summary.count) * 100 : 0
                  return (
                    <li key={n}>
                      <button
                        type="button"
                        onClick={() => setFilter(filter === n ? null : n)}
                        aria-pressed={filter === n}
                        disabled={!c}
                        className={cn('flex w-full items-center gap-3 rounded-lg px-1 py-1 text-sm transition-colors disabled:opacity-40', filter === n ? 'bg-ink/[0.06]' : 'hover:bg-ink/5')}
                      >
                        <span className="w-8 font-mono text-xs">{n}★</span>
                        <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
                          <motion.span className="absolute inset-y-0 left-0 rounded-full bg-ink" initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} />
                        </span>
                        <span className="w-6 text-right font-mono text-xs text-stone">{c}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-8">
                <FitMeter fit={summary.fit} />
              </div>
            </>
          ) : (
            <>
              <p className="mt-5 text-[1.35rem] font-medium">No reviews yet.</p>
              <p className="mt-3 text-sm text-stone">Own {productTitle}? Tell others how it wears, washes and fits.</p>
            </>
          )}
          {mine ? (
            <p className="mt-6 bg-bone p-4 text-sm">
              {mine.status === 'approved' ? 'Thank you — your review is published below.' : mine.status === 'pending' ? 'Thank you — your review is with our team and will appear once approved.' : 'Your review was not published. Contact us if you have questions.'}
            </p>
          ) : (
            <Button onClick={start} className="mt-8" arrow>
              Write a review
            </Button>
          )}
        </aside>

        <div>
          {reviews.length ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-5">
                <p className="text-sm text-stone">
                  {filter ? `${list.length} with ${filter} stars` : `${reviews.length} review${reviews.length === 1 ? '' : 's'}`}
                  {filter ? (
                    <button type="button" onClick={() => setFilter(null)} className="link-wipe ml-3 text-ink">
                      Show all
                    </button>
                  ) : null}
                </p>
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-stone">Sort</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="border border-ink/15 bg-transparent px-3 py-1.5">
                    <option value="newest">Newest</option>
                    <option value="helpful">Most helpful</option>
                    <option value="highest">Highest rated</option>
                    <option value="lowest">Lowest rated</option>
                  </select>
                </label>
              </div>
              <ul className="divide-y divide-ink/10">
                <AnimatePresence initial={false}>
                  {list.slice(0, shown).map((r) => (
                    <motion.li key={r.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="py-8">
                      <article>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <Stars value={r.rating} size={14} />
                          <span className="text-xs text-stone">{formatDate(r.createdAt)}</span>
                        </div>
                        <h3 className="mt-4 text-[1.05rem] font-medium">{r.title}</h3>
                        <p className="mt-3 max-w-prose leading-relaxed text-stone">{r.body}</p>
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                          <span className="font-medium">{r.author}</span>
                          {r.verified ? <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs text-success">Verified buyer</span> : null}
                          {r.fit ? <span className="text-xs text-stone">Fit: {r.fit === 'true' ? 'true to size' : r.fit === 'small' ? 'runs small' : 'runs large'}</span> : null}
                        </div>
                        {r.adminReply ? (
                          <div className="mt-5 border-l-2 border-ink bg-bone p-4 text-sm">
                            <p className="text-eyebrow text-burgundy">Reply from the atelier</p>
                            <p className="mt-2">{r.adminReply}</p>
                          </div>
                        ) : null}
                        <button type="button" onClick={() => markHelpful(r.id)} disabled={helped.has(r.id)} className="mt-5 border border-ink/15 px-3 py-1.5 text-xs transition-colors hover:border-ink/40 disabled:opacity-60">
                          {helped.has(r.id) ? 'Thanks for the feedback' : 'Helpful'} · {r.helpful}
                        </button>
                      </article>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              {list.length > shown ? (
                <Button variant="outline" onClick={() => setShown((n) => n + 6)} className="mt-4">
                  Show more reviews
                </Button>
              ) : null}
            </>
          ) : (
            <div className="flex h-full min-h-[220px] items-center justify-center border border-dashed border-ink/15 p-10 text-center text-stone">
              Reviews from customers who own this piece will appear here.
            </div>
          )}
        </div>
      </div>

      <Overlay open={writing} onClose={() => setWriting(false)} label="Write a review" side="right" className="bg-ivory text-ink">
        <ReviewForm
          handle={handle}
          productTitle={productTitle}
          onClose={() => setWriting(false)}
          onCreated={(r) => {
            setMine(r)
            if (r.status === 'approved') {
              setReviews((rs) => [r, ...rs])
              const dist = [...summary.distribution] as RatingSummary['distribution']
              dist[r.rating - 1] += 1
              const count = summary.count + 1
              setSummary({ ...summary, count, distribution: dist, average: Math.round(((summary.average * summary.count + r.rating) / count) * 10) / 10 })
            }
          }}
        />
      </Overlay>
    </section>
  )
}

function ReviewForm({ handle, productTitle, onClose, onCreated }: { handle: string; productTitle: string; onClose: () => void; onCreated: (r: Review) => void }) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [fit, setFit] = useState<ReviewFit | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fields, setFields] = useState<Record<string, string>>({})
  const [done, setDone] = useState<Review | null>(null)
  const moderated = useSettings().reviews.moderation === 'manual'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!rating) {
      setFields({ rating: 'Choose a rating' })
      return
    }
    setBusy(true)
    setError(null)
    setFields({})
    try {
      const { review } = await api<{ review: Review }>(`/api/products/${handle}/reviews`, { body: { rating, title, body, fit } })
      setDone(review)
      onCreated(review)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send your review.')
      if (err instanceof ApiError && err.fields) setFields(err.fields)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
        <h2 className="text-[1.15rem] font-medium">Your review</h2>
        <CloseButton onClick={onClose} />
      </div>
      {done ? (
        <div className="p-6">
          <p className="text-[1.35rem] font-medium">Thank you.</p>
          <p className="mt-3 text-stone">
            {done.status === 'approved' ? 'Your review is now live on the page.' : 'Your review has been sent to our team and will appear once approved.'}
            {done.verified ? ' It carries a verified-buyer badge.' : ''}
          </p>
          <Button onClick={onClose} className="mt-8">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-6 p-6" noValidate>
          <p className="text-sm text-stone">Reviewing {productTitle}</p>
          <StarInput value={rating} onChange={setRating} error={fields.rating} />
          <Field label="Headline" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} error={fields.title} data-autofocus />
          <TextArea label="How does it wear, wash and feel?" required rows={6} maxLength={4000} value={body} onChange={(e) => setBody(e.target.value)} error={fields.body} />
          <fieldset>
            <legend className="text-eyebrow text-stone">How does it fit? (optional)</legend>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {(
                [
                  ['small', 'Runs small'],
                  ['true', 'True to size'],
                  ['large', 'Runs large'],
                ] as [ReviewFit, string][]
              ).map(([v, label]) => (
                <button key={v} type="button" aria-pressed={fit === v} onClick={() => setFit(fit === v ? null : v)} className={cn('border px-3 py-3 text-sm transition-colors', fit === v ? 'border-ink bg-ink text-ivory' : 'border-ink/15 hover:border-ink/40')}>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>
          {error ? (
            <p role="alert" className="bg-error/[0.07] px-4 py-3 text-sm text-error">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="lg" block loading={busy} arrow>
            Submit review
          </Button>
          <p className="text-xs text-stone">{moderated ? 'Reviews are checked by our team before they are published. ' : ''}Please keep reviews about the piece itself.</p>
        </form>
      )}
    </div>
  )
}
