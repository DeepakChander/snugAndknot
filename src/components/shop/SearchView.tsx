'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import ProductCard, { type CardProduct } from '@/components/store/ProductCard'
import { ButtonLink } from '@/components/kit/Button'
import { SearchIcon } from '@/components/kit/icons'
import { cn } from '@/lib/format'

const SUGGESTIONS = ['Cardigan', 'Knit tee', 'Merino', 'Cashmere', 'Cable knit', 'Terracotta']

export default function SearchView({ query, results, popular }: { query: string; results: CardProduct[]; popular: CardProduct[] }) {
  const router = useRouter()
  const [q, setQ] = useState(query)
  const [pending, start] = useTransition()
  const go = (term: string) => start(() => router.replace(term.trim() ? `/search?q=${encodeURIComponent(term.trim())}` : '/search', { scroll: false }))

  return (
    <div className="bg-ivory pb-28 pt-nav text-ink">
      <div className="container-wide pt-12 md:pt-20">
        <p className="text-eyebrow text-burgundy">Search</p>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            go(q)
          }}
          className="mt-6 flex items-center gap-4 border-b border-ink/20 pb-4 focus-within:border-ink"
        >
          <SearchIcon size={34} className="hidden shrink-0 text-stone sm:block" />
          <label htmlFor="search-page" className="sr-only">
            Search products
          </label>
          <input
            id="search-page"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="What are you looking for?"
            className="min-w-0 flex-1 bg-transparent font-display text-[clamp(2.25rem,6vw,5.5rem)] leading-none tracking-[-0.03em] outline-none placeholder:text-ink/20"
          />
          <button type="submit" className="shrink-0 rounded-full bg-ink px-5 py-3 text-sm text-ivory hover:bg-burgundy">
            Search
          </button>
        </form>
        <div className="mt-5 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setQ(s)
                go(s)
              }}
              className="rounded-full border border-ink/15 px-4 py-1.5 text-sm hover:border-ink/50"
            >
              {s}
            </button>
          ))}
        </div>

        <div className={cn('mt-14 transition-opacity', pending && 'opacity-50')} aria-live="polite">
          {query ? (
            <p className="text-label text-stone">
              {results.length} result{results.length === 1 ? '' : 's'} for <span className="text-ink">“{query}”</span>
            </p>
          ) : null}
          {query && results.length ? (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-14 md:gap-x-6 lg:grid-cols-4">
              {results.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              {query ? (
                <div className="mb-14 max-w-xl">
                  <h2 className="text-headline">Nothing by that name.</h2>
                  <p className="mt-4 text-stone">Try a fabric, a colour or a type of piece. Or start from what people are loving:</p>
                </div>
              ) : (
                <h2 className="mb-10 text-title">Popular right now</h2>
              )}
              <div className="grid grid-cols-2 gap-x-4 gap-y-14 md:gap-x-6 lg:grid-cols-4">
                {popular.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
              <ButtonLink href="/shop" variant="outline" className="mt-14" arrow>
                Browse everything
              </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
