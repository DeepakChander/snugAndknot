'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useUIStore } from '@/stores/ui-store'
import { useMoney } from '@/components/providers/SettingsProvider'
import { useDialogBehaviour } from '@/components/kit/Overlay'
import { api } from '@/lib/api'
import { ArrowRight, SearchIcon, XIcon } from '@/components/kit/icons'
import type { Product } from '@/types/commerce'

const EASE = [0.16, 1, 0.3, 1] as const
const SUGGESTIONS = ['Cardigan', 'Knit tee', 'Merino', 'Cashmere', 'Cable knit', 'Women', 'Men']
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
  const money = useMoney()
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
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.8, ease: [0.87, 0, 0.13, 1] }}
          className="fixed inset-0 z-[130] overflow-y-auto bg-noir text-bone"
        >
          <div className="container-wide pb-16 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-eyebrow text-taupe">Search the atelier</span>
              <button type="button" onClick={closeSearch} data-cursor="hover" className="flex h-11 items-center gap-2 rounded-full border border-bone/15 px-4 text-label hover:bg-bone/5">
                Close <XIcon size={14} />
              </button>
            </div>

            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault()
                submit(q)
              }}
              className="mt-[8vh] flex items-center gap-4 border-b border-bone/20 pb-4 focus-within:border-bone/60"
            >
              <SearchIcon size={32} className="hidden shrink-0 text-bone/40 sm:block" />
              <label htmlFor="site-search" className="sr-only">
                Search products
              </label>
              <input
                id="site-search"
                data-autofocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cardigans, merino, gifts…"
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent font-display text-[clamp(2.25rem,7vw,6.5rem)] leading-none tracking-[-0.03em] outline-none placeholder:text-bone/20"
              />
              {loading ? <span className="h-5 w-5 shrink-0 animate-spin rounded-full border border-bone/20 border-t-gold" aria-label="Searching" /> : null}
            </form>

            {results === null ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.3 }} className="mt-10 grid gap-10 md:grid-cols-2">
                <div>
                  <p className="text-eyebrow text-taupe">Popular</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button key={s} type="button" onClick={() => setQ(s)} data-cursor="hover" className="rounded-full border border-bone/15 px-4 py-2 text-sm transition-colors hover:border-gold hover:text-gold-light">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {recent.length ? (
                  <div>
                    <p className="text-eyebrow text-taupe">Recent</p>
                    <ul className="mt-4 space-y-2">
                      {recent.map((r) => (
                        <li key={r}>
                          <button type="button" onClick={() => setQ(r)} className="link-wipe text-lg text-bone/80">
                            {r}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </motion.div>
            ) : results.length === 0 && !loading ? (
              <p className="mt-10 text-lead text-bone/60">
                Nothing matches “{q.trim()}”. Try a fabric, a colour or a piece — or{' '}
                <Link href="/shop" onClick={closeSearch} className="link-wipe text-bone">
                  browse everything
                </Link>
                .
              </p>
            ) : (
              <div className="mt-10">
                <div className="flex items-baseline justify-between">
                  <p className="text-eyebrow text-taupe" aria-live="polite">
                    {results.length} result{results.length === 1 ? '' : 's'}
                  </p>
                  <button type="button" onClick={() => submit(q)} className="group flex items-center gap-2 text-label text-gold-light">
                    <span className="link-wipe">See all results</span> <ArrowRight size={14} />
                  </button>
                </div>
                <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {results.map((p, i) => (
                    <motion.li key={p.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: i * 0.05 }}>
                      <Link
                        href={`/product/${p.handle}`}
                        onClick={() => {
                          saveRecent(q.trim())
                          closeSearch()
                        }}
                        className="group block"
                        data-cursor="view"
                        data-cursor-label="View"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-umber">
                          {p.images[0] ? <Image src={p.images[0].src} alt={p.images[0].alt} fill sizes="(min-width:768px) 25vw, 50vw" className="object-cover transition-transform duration-1000 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105" /> : null}
                        </div>
                        <p className="mt-3 font-display text-xl leading-tight">{p.title}</p>
                        <p className="font-mono text-sm text-taupe">{money(p.price)}</p>
                      </Link>
                    </motion.li>
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
