'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import SplitReveal from '@/components/motion/SplitReveal'
import ProductCard, { type CardProduct } from '@/components/store/ProductCard'
import NewsletterForm from '@/components/chrome/NewsletterForm'
import { Button, ButtonLink } from '@/components/kit/Button'
import { FilterIcon, GridIcon, LargeIcon, XIcon } from '@/components/kit/icons'
import { useMoney } from '@/components/providers/SettingsProvider'
import { cn } from '@/lib/format'
import type { ShopFilters } from '@/lib/shop-filters'
import { useQueryState } from './useQueryState'
import FanDeck from './FanDeck'
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
  deck,
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
  deck: { src: string; alt: string }[]
  comingSoon?: { title: string; body: string }
}) {
  const { set, pending } = useQueryState()
  const money = useMoney()
  const [drawer, setDrawer] = useState(false)
  const [dense, setDense] = useState(false)

  useEffect(() => {
    try {
      setDense(localStorage.getItem(DENSITY_KEY) === 'dense')
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
      <section className="relative overflow-hidden bg-ivory pt-nav text-ink">
        <div className="container-wide grid items-end gap-10 pb-12 pt-10 md:pt-16 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <nav aria-label="Breadcrumb" className="text-eyebrow text-stone">
              <Link href="/" className="link-wipe">
                Home
              </Link>{' '}
              / <span className="text-burgundy">{eyebrow}</span>
            </nav>
            <SplitReveal as="h1" type="chars" intro className="mt-5 text-mega">
              {title}
            </SplitReveal>
            <div className="mt-6 flex flex-wrap items-end gap-x-10 gap-y-4">
              <p className="max-w-md text-lead text-stone">{description}</p>
              <p className="font-mono text-sm text-stone">
                <span className="text-ink">{String(products.length).padStart(2, '0')}</span> piece{products.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>
          {deck.length ? <FanDeck images={deck} className="mx-auto hidden h-[clamp(260px,32vw,440px)] w-full max-w-lg lg:block" /> : null}
        </div>
      </section>

      {/* Toolbar */}
      <div className="sticky top-[var(--nav-offset)] z-30 border-y border-ink/10 bg-ivory/90 text-ink backdrop-blur-xl transition-[top] duration-700 ease-[cubic-bezier(.16,1,.3,1)]" data-shop-toolbar>
        <div className="container-wide flex items-center gap-3 py-3">
          <nav aria-label="Departments" className="no-scrollbar -mx-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1">
            {segments.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                scroll={false}
                aria-current={s.active ? 'page' : undefined}
                className={cn('relative shrink-0 rounded-full px-4 py-2 text-sm transition-colors', s.active ? 'text-ivory' : 'text-ink/70 hover:text-ink')}
              >
                {s.active ? <motion.span layoutId="shop-seg" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} /> : null}
                <span className="relative">
                  {s.label}
                  {s.count !== undefined ? <span className="ml-1.5 font-mono text-[0.7rem] opacity-60">{s.count}</span> : null}
                </span>
              </Link>
            ))}
            {categories.length ? <span className="mx-2 h-5 w-px shrink-0 bg-ink/15" aria-hidden /> : null}
            {categories.map((c) => (
              <Link key={c.href} href={c.href} aria-current={c.active ? 'page' : undefined} className={cn('shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition-colors', c.active ? 'border-burgundy bg-burgundy text-ivory' : 'border-ink/15 hover:border-ink/40')}>
                {c.label}
              </Link>
            ))}
          </nav>
          <label className="relative hidden shrink-0 items-center md:flex">
            <span className="sr-only">Sort by</span>
            <select
              value={filters.sort}
              onChange={(e) => set({ sort: e.target.value === 'featured' ? null : e.target.value })}
              className="appearance-none rounded-full border border-ink/15 bg-transparent py-2 pl-4 pr-9 text-sm outline-none hover:border-ink/40 focus:border-ink"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-3.5 h-3 w-3 opacity-60" viewBox="0 0 12 12" aria-hidden>
              <path d="M2 4.5 6 8l4-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </label>
          <button type="button" onClick={() => setDrawer(true)} data-cursor="hover" className="flex shrink-0 items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm hover:border-ink/40">
            <FilterIcon size={16} /> Filter
            {activeCount ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-burgundy px-1 font-mono text-[10px] text-ivory">{activeCount}</span> : null}
          </button>
          <div className="hidden shrink-0 items-center rounded-full border border-ink/15 p-1 lg:flex" role="group" aria-label="Grid density">
            <button type="button" onClick={() => toggleDensity(false)} aria-pressed={!dense} aria-label="Larger pieces" className={cn('rounded-full p-1.5', !dense && 'bg-ink text-ivory')}>
              <LargeIcon size={16} />
            </button>
            <button type="button" onClick={() => toggleDensity(true)} aria-pressed={dense} aria-label="More pieces per row" className={cn('rounded-full p-1.5', dense && 'bg-ink text-ivory')}>
              <GridIcon size={16} />
            </button>
          </div>
        </div>
        {/* Mobile sort */}
        <div className="container-wide flex items-center gap-2 pb-3 md:hidden">
          <label className="relative flex flex-1 items-center">
            <span className="sr-only">Sort by</span>
            <select value={filters.sort} onChange={(e) => set({ sort: e.target.value === 'featured' ? null : e.target.value })} className="w-full appearance-none rounded-full border border-ink/15 bg-transparent py-2 pl-4 pr-9 text-sm">
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
      <section className={cn('bg-ivory pb-28 pt-10 text-ink transition-opacity duration-300', pending && 'opacity-50')} aria-busy={pending} aria-label="Products">
        <div className="container-wide">
          {products.length ? (
            <div className={cn('grid gap-x-4 gap-y-14 md:gap-x-6', dense ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3')}>
              {products.map((p, i) => (
                <ProductCardSlot key={p.id} product={p} index={i} showInterlude={i === 1 && products.length > 2} dense={dense} />
              ))}
            </div>
          ) : comingSoon ? (
            <div className="mx-auto max-w-2xl py-20 text-center">
              <p className="text-eyebrow text-burgundy">In the workroom</p>
              <h2 className="mt-5 text-headline">{comingSoon.title}</h2>
              <p className="mx-auto mt-5 max-w-md text-stone">{comingSoon.body}</p>
              <NewsletterForm source="coming-soon" tone="light" cta="Notify me" className="mx-auto mt-10 max-w-md text-left" />
              <ButtonLink href="/shop" variant="outline" className="mt-10" arrow>
                Browse all pieces
              </ButtonLink>
            </div>
          ) : (
            <div className="mx-auto max-w-xl py-24 text-center">
              <h2 className="text-headline">Nothing matches — yet.</h2>
              <p className="mt-5 text-stone">Try removing a filter or two; we add pieces in small batches through the season.</p>
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

const INTERLUDE = { src: '/images/lookbook/golden-hour-1.png', quote: 'Made to be reached for, every cold morning.' }

function ProductCardSlot({ product, index, showInterlude, dense }: { product: CardProduct; index: number; showInterlude: boolean; dense: boolean }) {
  return (
    <>
      <ProductCard product={product} index={index} priority={index < 2} sizes={dense ? '(min-width:1280px) 25vw, (min-width:768px) 33vw, 50vw' : '(min-width:1024px) 33vw, 50vw'} />
      {showInterlude ? (
        <motion.figure
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative col-span-2 hidden overflow-hidden rounded-[1.25rem] bg-umber md:block md:col-span-1 lg:row-span-1"
        >
          <Image src={INTERLUDE.src} alt="" fill sizes="33vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-noir/70 to-transparent" />
          <figcaption className="absolute inset-x-6 bottom-6 font-display text-3xl leading-tight text-bone">{INTERLUDE.quote}</figcaption>
        </motion.figure>
      ) : null}
    </>
  )
}
