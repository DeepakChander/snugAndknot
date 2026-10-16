'use client'

import { useEffect, useState } from 'react'
import Overlay, { CloseButton } from '@/components/kit/Overlay'
import { Button } from '@/components/kit/Button'
import { useMoney, useCurrency } from '@/components/providers/SettingsProvider'
import { cn } from '@/lib/format'
import type { ShopFilters } from '@/lib/shop-filters'
import type { ColorSwatch } from '@/types/commerce'

export interface Facets {
  sizes: string[]
  colors: ColorSwatch[]
  priceRange: [number, number]
}

export default function FilterDrawer({
  open,
  onClose,
  facets,
  filters,
  onApply,
  resultCount,
}: {
  open: boolean
  onClose: () => void
  facets: Facets
  filters: ShopFilters
  onApply: (f: { sizes: string[]; colors: string[]; min: number | null; max: number | null }) => void
  resultCount: number
}) {
  const money = useMoney()
  const { currency: cur } = useCurrency()
  const [sizes, setSizes] = useState<string[]>(filters.sizes)
  const [colors, setColors] = useState<string[]>(filters.colors)
  const [min, setMin] = useState<string>(filters.min?.toString() ?? '')
  const [max, setMax] = useState<string>(filters.max?.toString() ?? '')

  useEffect(() => {
    if (!open) return
    setSizes(filters.sizes)
    setColors(filters.colors)
    setMin(filters.min?.toString() ?? '')
    setMax(filters.max?.toString() ?? '')
  }, [open, filters])

  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const [lo, hi] = facets.priceRange

  return (
    <Overlay open={open} onClose={onClose} label="Filters" side="left" className="flex flex-col bg-ivory text-ink">
      <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
        <h2 className="text-[1.15rem] font-medium">Filter</h2>
        <CloseButton onClick={onClose} />
      </div>
      <div className="flex-1 space-y-10 overflow-y-auto px-6 py-8" data-lenis-prevent>
        <fieldset>
          <legend className="text-eyebrow text-stone">Size</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {facets.sizes.map((s) => {
              const on = sizes.includes(s)
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSizes(toggle(sizes, s))}
                  className={cn('min-w-12 border px-4 py-2.5 text-sm transition-colors', on ? 'border-ink bg-ink text-ivory' : 'border-ink/15 hover:border-ink/50')}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-eyebrow text-stone">Colour</legend>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {facets.colors.map((c) => {
              const on = colors.includes(c.name)
              return (
                <button
                  key={c.name}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setColors(toggle(colors, c.name))}
                  className={cn('flex items-center gap-3 border px-3 py-2.5 text-left text-sm transition-colors', on ? 'border-ink bg-ink/[0.04]' : 'border-ink/10 hover:border-ink/40')}
                >
                  <span className="h-4 w-4 shrink-0 ring-1 ring-ink/15" style={{ background: c.hex }} />
                  {c.name}
                </button>
              )
            })}
          </div>
        </fieldset>
        {/* Prices are filtered on the base-currency price, so the filter is offered only in it. */}
        {cur.base ? (
          <fieldset>
            <legend className="text-eyebrow text-stone">Price</legend>
            <p className="mt-2 text-xs text-stone">
              Pieces range from {money(lo)} to {money(hi)}.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-stone">From</span>
                <input type="number" inputMode="numeric" min={0} value={min} onChange={(e) => setMin(e.target.value)} placeholder={String(Math.floor(lo))} className="mt-1 w-full border border-ink/15 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-ink/60" />
              </label>
              <label className="block">
                <span className="text-xs text-stone">To</span>
                <input type="number" inputMode="numeric" min={0} value={max} onChange={(e) => setMax(e.target.value)} placeholder={String(Math.ceil(hi))} className="mt-1 w-full border border-ink/15 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-ink/60" />
              </label>
            </div>
          </fieldset>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-2 border-t border-ink/10 p-6">
        <Button
          variant="outline"
          onClick={() => {
            onApply({ sizes: [], colors: [], min: null, max: null })
            onClose()
          }}
        >
          Clear all
        </Button>
        <Button
          onClick={() => {
            const toNum = (v: string) => (v.trim() === '' || !Number.isFinite(Number(v)) ? null : Math.max(0, Number(v)))
            onApply({ sizes, colors, min: toNum(min), max: toNum(max) })
            onClose()
          }}
        >
          {`Show results`}
        </Button>
        <p className="col-span-2 text-center text-xs text-stone">{resultCount} item{resultCount === 1 ? '' : 's'} shown now</p>
      </div>
    </Overlay>
  )
}
