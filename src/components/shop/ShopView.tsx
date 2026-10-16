'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import ProductCard, { type CardProduct } from '@/components/store/ProductCard'
import NewsletterForm from '@/components/chrome/NewsletterForm'
import { Button, ButtonLink } from '@/components/kit/Button'
import { FilterIcon, GridIcon, LargeIcon, XIcon } from '@/components/kit/icons'
import { useMoney } from '@/components/providers/SettingsProvider'
import { cn } from '@/lib/format'
import type { ShopFilters } from '@/lib/shop-filters'
import { useQueryState } from './useQueryState'
import FilterDrawer, { type Facets } from './FilterDrawer'

const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price, low to high' },
  { id: 'price-desc', label: 'Price, high to low' },
  { id: 'rating', label: 'Top rated' },
]

export interface ShopLink {
  label: string
  href: string
  active: boolean
  count?: number
}

const DENSITY_KEY = 'sk-grid-density'

export default function ShopView({
  eyebrow,
  title,
  description,
  products,
  facets,
  filters,
  segments,
  categories,
  tiles = [],
  comingSoon,
}: {
  eyebrow: string
  title: string
  description: string
  products: CardProduct[]
  facets: Facets
  filters: ShopFilters
  segments: ShopLink[]
  categories: ShopLink[]
  /** A department's categories as photograph tiles (its own page only). */
  tiles?: { label: string; href: string; image: string }[]
  comingSoon?: { title: string; body: string }
}) {
  const { set, pending } = useQueryState()
  const money = useMoney()
  const [drawer, setDrawer] = useState(false)
  const [dense, setDense] = useState(true)

  useEffect(() => {
    try {
      setDense(localStorage.getItem(DENSITY_KEY) !== 'roomy')
    } catch {}
  }, [])
  const toggleDensity = (d: boolean) => {
    setDense(d)
    try {
      localStorage.setItem(DENSITY_KEY, d ? 'dense' : 'roomy')
    } catch {}
  }

  const activeCount = filters.sizes.length + filters.colors.length + (filters.min !== null ? 1 : 0) + (filters.max !== null ? 1 : 0)
  const chips = [
    ...filters.sizes.map((s) => ({ key: `size-${s}`, label: `Size ${s}`, clear: () => set({ size: filters.sizes.filter((x) => x !== s) }) })),
    ...filters.colors.map((c) => ({ key: `color-${c}`, label: c, clear: () => set({ color: filters.colors.filter((x) => x !== c) }) })),
    ...(filters.min !== null ? [{ key: 'min', label: `From ${money(filters.min)}`, clear: () => set({ min: null }) }] : []),
    ...(filters.max !== null ? [{ key: 'max', label: `Up to ${money(filters.max)}`, clear: () => set({ max: null }) }] : []),
  ]

  return (
    <>
      {/* Header */}
      <section className="bg-ivory pt-nav text-ink">
        <div className="container-wide pb-6 pt-8 md:pt-12">
          <nav aria-label="Breadcrumb" className="text-[0.72rem] uppercase tracking-[0.12em] text-stone">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>{' '}
            / <span className="text-ink">{eyebrow.replace(/^Shop \/ /, '')}</span>
          </nav>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-3">
            <h1 className="text-display">{title}</h1>
            <p className="text-[0.86rem] text-stone">
              {products.length} item{products.length === 1 ? '' : 's'}
            </p>
          </div>
          {description ? <p className="mt-3 max-w-2xl text-[0.95rem] text-stone">{description}</p> : null}
        </div>
        {tiles.length ? (
          <ul aria-label="Categories" className="no-scrollbar container-wide flex gap-3 overflow-x-auto pb-6 md:gap-4">
            {tiles.map((t) => (
              <li key={t.href} className="w-[30vw] shrink-0 sm:w-[20vw] lg:w-[11.5%]">
                <Link href={t.href} className="group block">
                  <span className="relative block aspect-[4/5] overflow-hidden bg-bone">
                    <Image src={t.image} alt="" fill sizes="(min-width: 1024px) 12vw, (min-width: 640px) 20vw, 30vw" className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" unoptimized={t.image.startsWith('/api/media/')} />
                  </span>
                  <span className="mt-2 block text-[0.8rem] group-hover:underline group-hover:underline-offset-4">{t.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {/* Toolbar */}
      <div className="sticky top-[var(--nav-offset)] z-30 border-y border-ink/10 bg-ivory/95 text-ink backdrop-blur transition-[top] duration-300" data-shop-toolbar>
        <div className="container-wide flex items-center gap-4 py-2.5">
          <nav aria-label="Departments and categories" className="no-scrollbar -mx-1 flex min-w-0 flex-1 items-center gap-5 overflow-x-auto px-1">
            {segments.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                scroll={false}
                aria-current={s.active ? 'page' : undefined}
                className={cn('relative shrink-0 py-1.5 text-[0.74rem] font-medium uppercase tracking-[0.12em] transition-colors', s.active ? 'text-ink after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-ink' : 'text-ink/55 hover:text-ink')}
              >
                {s.label}
              </Link>
            ))}
            {categories.length ? <span className="h-4 w-px shrink-0 bg-ink/15" aria-hidden /> : null}
            {categories.map((c) => (
              <Link key={c.href} href={c.href} aria-current={c.active ? 'page' : undefined} className={cn('shrink-0 py-1.5 text-[0.84rem] transition-colors', c.active ? 'font-medium text-ink underline underline-offset-4' : 'text-ink/65 hover:text-ink')}>
                {c.label}
              </Link>
            ))}
          </nav>
          <label className="relative hidden shrink-0 items-center md:flex">
            <span className="sr-only">Sort by</span>
            <select
              value={filters.sort}
              onChange={(e) => set({ sort: e.target.value === 'featured' ? null : e.target.value })}
              className="appearance-none border-0 bg-transparent py-2 pl-2 pr-7 text-[0.84rem] outline-none hover:underline focus-visible:outline-2"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  Sort: {s.label}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-1.5 h-3 w-3 opacity-60" viewBox="0 0 12 12" aria-hidden>
              <path d="M2 4.5 6 8l4-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </label>
          <button type="button" onClick={() => setDrawer(true)} className="flex shrink-0 items-center gap-2 border border-ink px-3.5 py-2 text-[0.72rem] font-medium uppercase tracking-[0.12em] hover:bg-ink hover:text-ivory">
            <FilterIcon size={15} /> Filter
            {activeCount ? <span className="flex h-4 min-w-4 items-center justify-center bg-ink px-1 text-[10px] text-ivory">{activeCount}</span> : null}
          </button>
          <div className="hidden shrink-0 items-center gap-1 lg:flex" role="group" aria-label="Pieces per row">
            <button type="button" onClick={() => toggleDensity(false)} aria-pressed={!dense} aria-label="Three per row" className={cn('p-1.5', dense ? 'text-ink/40 hover:text-ink' : 'text-ink')}>
              <LargeIcon size={16} />
            </button>
            <button type="button" onClick={() => toggleDensity(true)} aria-pressed={dense} aria-label="Four per row" className={cn('p-1.5', dense ? 'text-ink' : 'text-ink/40 hover:text-ink')}>
              <GridIcon size={16} />
            </button>
          </div>
        </div>
        {/* Mobile sort */}
        <div className="container-wide flex items-center gap-2 pb-2.5 md:hidden">
          <label className="relative flex flex-1 items-center">
            <span className="sr-only">Sort by</span>
            <select value={filters.sort} onChange={(e) => set({ sort: e.target.value === 'featured' ? null : e.target.value })} className="w-full appearance-none border border-ink/15 bg-transparent py-2 pl-3 pr-9 text-[0.84rem]">
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  Sort: {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Active filters */}
      <AnimatePresence initial={false}>
        {chips.length ? (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-ivory">
            <div className="container-wide flex flex-wrap items-center gap-2 pt-5">
              {chips.map((c) => (
                <button key={c.key} type="button" onClick={c.clear} className="flex items-center gap-2 rounded-full bg-ink/[0.06] px-3 py-1.5 text-xs hover:bg-ink/10" aria-label={`Remove filter ${c.label}`}>
                  {c.label} <XIcon size={11} />
                </button>
              ))}
              <button type="button" onClick={() => set({ size: null, color: null, min: null, max: null })} className="link-wipe ml-2 text-xs text-stone">
                Clear all
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Grid */}
      <section className={cn('bg-ivory pb-24 pt-6 text-ink transition-opacity duration-300', pending && 'opacity-50')} aria-busy={pending} aria-label="Products">
        <div className="container-wide">
          {products.length ? (
            <div className={cn('grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-4', dense ? 'md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-3')}>
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 2} sizes={dense ? '(min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw' : '(min-width:768px) 33vw, 50vw'} />
              ))}
            </div>
          ) : comingSoon ? (
            <div className="mx-auto max-w-xl py-20 text-center">
              <p className="text-eyebrow text-stone">Coming soon</p>
              <h2 className="mt-4 text-headline">{comingSoon.title}</h2>
              <p className="mx-auto mt-4 max-w-md text-stone">{comingSoon.body}</p>
              <NewsletterForm source="coming-soon" tone="light" cta="Notify me" className="mx-auto mt-8 max-w-md text-left" />
              <ButtonLink href="/shop" variant="outline" className="mt-8">
                Shop everything
              </ButtonLink>
            </div>
          ) : (
            <div className="mx-auto max-w-xl py-24 text-center">
              <h2 className="text-headline">No pieces match.</h2>
              <p className="mt-4 text-stone">Try removing a filter or two.</p>
              <Button variant="outline" className="mt-8" onClick={() => set({ size: null, color: null, min: null, max: null })}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <FilterDrawer open={drawer} onClose={() => setDrawer(false)} facets={facets} filters={filters} resultCount={products.length} onApply={(f) => set({ size: f.sizes, color: f.colors, min: f.min === null ? null : String(f.min), max: f.max === null ? null : String(f.max) })} />
    </>
  )
}
