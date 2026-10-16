'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useUIStore } from '@/stores/ui-store'
import { ProductPrice } from '@/components/kit/Price'
import { useDialogBehaviour } from '@/components/kit/Overlay'
import { api } from '@/lib/api'
import { ArrowRight, SearchIcon, XIcon } from '@/components/kit/icons'
import type { Product } from '@/types/commerce'

const SUGGESTIONS = ['T-shirts', 'Shirts', 'Knitwear', 'Cardigan', 'Jeans', 'Women', 'Men', 'Kids']
const RECENT_KEY = 'sk-recent-searches'

function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]').slice(0, 5)
  } catch {
    return []
  }
}

function saveRecent(q: string) {
  try {
    const next = [q, ...readRecent().filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, 5)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {}
}

export default function SearchOverlay() {
  const { isSearchOpen, closeSearch } = useUIStore()
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Product[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  useDialogBehaviour(isSearchOpen, ref, closeSearch)

  useEffect(() => {
    if (isSearchOpen) setRecent(readRecent())
    else {
      setQ('')
      setResults(null)
    }
  }, [isSearchOpen])

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      setResults(null)
      setLoading(false)
      return
    }
    const ctrl = new AbortController()
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const { products } = await api<{ products: Product[] }>(`/api/products?q=${encodeURIComponent(term)}&limit=8`, { signal: ctrl.signal })
        setResults(products)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setResults([])
      } finally {
        if (!ctrl.signal.aborted) setLoading(false)
      }
    }, 220)
    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [q])

  const submit = (term: string) => {
    const t = term.trim()
    if (!t) return
    saveRecent(t)
    closeSearch()
    router.push(`/search?q=${encodeURIComponent(t)}`)
  }

  return (
    <AnimatePresence>
      {isSearchOpen ? (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
          data-chrome
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[130] overflow-y-auto bg-ivory text-ink"
        >
          <div className="container-wide pb-16 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow text-stone">Search</span>
              <button type="button" onClick={closeSearch} className="flex h-10 items-center gap-2 px-2 text-[0.72rem] font-medium uppercase tracking-[0.12em] hover:underline">
                Close <XIcon size={14} />
              </button>
            </div>

            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault()
                submit(q)
              }}
              className="mt-[6vh] flex items-center gap-4 border-b border-ink/20 pb-3 focus-within:border-ink"
            >
              <SearchIcon size={24} className="shrink-0 text-ink/50" />
              <label htmlFor="site-search" className="sr-only">
                Search products
              </label>
              <input
                id="site-search"
                data-autofocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search shirts, jeans, knitwear…"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent text-[clamp(1.4rem,3vw,2.25rem)] leading-tight outline-none placeholder:text-ink/30"
              />
              {loading ? <span className="h-5 w-5 shrink-0 animate-spin rounded-full border border-ink/15 border-t-ink" aria-label="Searching" /> : null}
            </form>

            {results === null ? (
              <div className="mt-10 grid gap-10 md:grid-cols-2">
                <div>
                  <p className="text-eyebrow text-stone">Popular</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} type="button" onClick={() => setQ(s)} data-cursor="hover" className="border border-ink/15 px-4 py-2 text-sm transition-colors hover:border-ink">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {recent.length ? (
                  <div>
                    <p className="text-eyebrow text-stone">Recent</p>
                    <ul className="mt-4 space-y-2">
                      {recent.map((r) => (
                        <li key={r}>
                          <button type="button" onClick={() => setQ(r)} className="text-[1rem] text-ink/75 hover:text-ink hover:underline">
                            {r}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : results.length === 0 && !loading ? (
              <p className="mt-10 text-lead text-stone">
                Nothing matches “{q.trim()}”. Try a fabric, a colour or a piece — or{' '}
                <Link href="/shop" onClick={closeSearch} className="text-ink underline">
                  browse everything
                </Link>
                .
              </p>
            ) : (
              <div className="mt-10">
                <div className="flex items-baseline justify-between">
                  <p className="text-eyebrow text-stone" aria-live="polite">
                    {results.length} result{results.length === 1 ? '' : 's'}
                  </p>
                  <button type="button" onClick={() => submit(q)} className="group flex items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.12em]">
                    <span className="border-b border-ink pb-0.5">See all results</span> <ArrowRight size={14} />
                  </button>
                </div>
                <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {results.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/product/${p.handle}`}
                        onClick={() => {
                          saveRecent(q.trim())
                          closeSearch()
                        }}
                        className="group block"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden bg-bone">
                          {p.images[0] ? <Image src={p.images[0].src} alt={p.images[0].alt} fill sizes="(min-width:768px) 25vw, 50vw" className="object-cover" /> : null}
                        </div>
                        <p className="mt-2.5 text-[0.86rem] leading-snug group-hover:underline">{p.title}</p>
                        <p><ProductPrice product={p} showCompareAt={false} className="text-[0.86rem] font-medium" /></p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
