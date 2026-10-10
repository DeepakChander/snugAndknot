'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { useRecentlyViewedStore } from '@/stores/recently-viewed-store'
import { useMoney, useSettings } from '@/components/providers/SettingsProvider'
import { Button } from '@/components/kit/Button'
import { Field } from '@/components/kit/Field'
import { Stars } from '@/components/kit/Stars'
import Price from '@/components/kit/Price'
import { AccordionItem } from '@/components/kit/Accordion'
import Overlay, { CloseButton } from '@/components/kit/Overlay'
import { WishlistButton } from '@/components/store/ProductCard'
import { QtyStepper } from '@/components/chrome/CartDrawer'
import { ReturnIcon, RulerIcon, TruckIcon, NeedleIcon } from '@/components/kit/icons'
import SizeGuideTable from './SizeGuideTable'
import { api, ApiError } from '@/lib/api'
import { cn, discountPercent } from '@/lib/format'
import type { Product, RatingSummary } from '@/types/commerce'

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size']

export default function ProductInfo({ product, summary }: { product: Product; summary: RatingSummary }) {
  const money = useMoney()
  const { commerce } = useSettings()
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const addToast = useUIStore((s) => s.addToast)
  const remember = useRecentlyViewedStore((s) => s.addHandle)

  const colors = useMemo(() => Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[], [product.variants])
  const [color, setColor] = useState<string | null>(colors[0] ?? null)
  const sizes = useMemo(
    () =>
      product.variants
        .filter((v) => !color || v.color === color)
        .sort((a, b) => SIZE_ORDER.indexOf(a.size ?? '') - SIZE_ORDER.indexOf(b.size ?? '') || a.position - b.position),
    [product.variants, color]
  )
  const [variantId, setVariantId] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [guide, setGuide] = useState(false)
  const [sizeError, setSizeError] = useState(false)

  // Single-variant products are always "selected".
  useEffect(() => {
    if (sizes.length === 1) setVariantId(sizes[0].id)
  }, [sizes])
  useEffect(() => remember(product.handle), [product.handle, remember])

  const variant = product.variants.find((v) => v.id === variantId) ?? null
  const price = variant?.price ?? product.price
  const compareAt = variant?.compareAtPrice ?? product.compareAtPrice
  const allSoldOut = product.variants.every((v) => !v.available)
  const low = variant && variant.available && variant.inventory <= 5
  const swatch = (name: string) => product.colors.find((c) => c.name === name)?.hex ?? '#bfa88e'

  function add() {
    if (!variant) {
      setSizeError(true)
      return
    }
    if (!variant.available) return
    addItem({
      productId: product.id,
      variantId: variant.id,
      handle: product.handle,
      title: product.title,
      image: product.images[0]?.src ?? '',
      price: variant.price,
      size: variant.size,
      color: variant.color,
      quantity: Math.min(qty, variant.inventory),
    })
    openCart()
  }

  return (
    <div className="flex flex-col">
      <nav aria-label="Breadcrumb" className="text-eyebrow text-stone">
        <Link href="/shop" className="link-wipe">
          Shop
        </Link>{' '}
        /{' '}
        <Link href={product.gender === 'unisex' ? '/shop' : `/shop/${product.gender}`} className="link-wipe capitalize">
          {product.gender}
        </Link>{' '}
        / <span className="text-burgundy">{product.productType}</span>
      </nav>

      <h1 className="mt-5 text-[clamp(2.6rem,4.6vw,4.4rem)] leading-[0.95] tracking-[-0.025em]">{product.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Price price={price} compareAt={compareAt} showSaving className="text-xl" />
        {summary.count > 0 ? (
          <a href="#reviews" className="flex items-center gap-2 text-sm text-stone hover:text-ink">
            <Stars value={summary.average} size={14} />
            <span>
              {summary.average.toFixed(1)} · {summary.count} review{summary.count === 1 ? '' : 's'}
            </span>
          </a>
        ) : (
          <a href="#reviews" className="link-wipe text-sm text-stone">
            Be the first to review
          </a>
        )}
      </div>
      {discountPercent(price, compareAt) > 0 ? <p className="mt-2 text-xs text-burgundy">You save {money((compareAt ?? price) - price)}</p> : null}

      <p className="mt-6 max-w-prose text-[0.95rem] leading-relaxed text-stone">{product.description.split('. ').slice(0, 2).join('. ')}.</p>

      {/* Colour */}
      {colors.length ? (
        <fieldset className="mt-8">
          <legend className="text-eyebrow text-stone">
            Colour — <span className="text-ink">{color}</span>
          </legend>
          <div className="mt-3 flex gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={c === color}
                aria-label={c}
                onClick={() => {
                  setColor(c)
                  setVariantId(null)
                }}
                className={cn('h-10 w-10 rounded-full ring-1 ring-ink/15 ring-offset-2 ring-offset-ivory transition-all', c === color && 'ring-2 ring-ink')}
                style={{ background: swatch(c) }}
              />
            ))}
          </div>
        </fieldset>
      ) : null}

      {/* Size */}
      <fieldset className="mt-7">
        <div className="flex items-center justify-between">
          <legend className="text-eyebrow text-stone">
            Size{variant?.size ? <> — <span className="text-ink">{variant.size}</span></> : null}
          </legend>
          <button type="button" onClick={() => setGuide(true)} className="flex items-center gap-1.5 text-xs text-stone hover:text-ink">
            <RulerIcon size={16} /> <span className="link-wipe">Size guide</span>
          </button>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {sizes.map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={v.id === variantId}
              onClick={() => {
                setVariantId(v.id)
                setSizeError(false)
                setQty(1)
              }}
              className={cn(
                'relative h-12 rounded-2xl border font-mono text-sm transition-all duration-300',
                v.id === variantId ? 'border-ink bg-ink text-ivory' : 'border-ink/15 hover:border-ink/50',
                !v.available && 'text-stone/60'
              )}
              aria-label={`Size ${v.size}${v.available ? '' : ' — sold out'}`}
            >
              {v.size}
              {!v.available ? <span className="absolute inset-x-2 top-1/2 h-px -rotate-12 bg-current" aria-hidden /> : null}
            </button>
          ))}
        </div>
        <AnimatePresence>
          {sizeError ? (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="mt-2 text-sm text-error">
              Choose a size to continue.
            </motion.p>
          ) : null}
        </AnimatePresence>
        {low ? <p className="mt-3 text-sm text-burgundy">Only {variant.inventory} left in {variant.size}.</p> : null}
      </fieldset>

      {/* Buy */}
      {variant && !variant.available ? (
        <StockAlertForm productId={product.id} variantId={variant.id} label={`${product.title} — ${variant.size}`} onDone={() => addToast(`We will let you know when ${product.title} is back.`)} />
      ) : allSoldOut ? (
        <StockAlertForm productId={product.id} variantId={null} label={product.title} onDone={() => addToast(`We will let you know when ${product.title} is back.`)} />
      ) : (
        <div className="mt-8 flex items-center gap-3">
          {variant ? <QtyStepper value={qty} onChange={(n) => setQty(Math.max(1, Math.min(n, variant.inventory, 20)))} max={Math.min(variant.inventory, 20)} label={product.title} /> : null}
          <Button size="lg" block onClick={add} arrow magnetic className="flex-1">
            {variant ? `Add to bag — ${money(price * qty)}` : 'Add to bag'}
          </Button>
          <WishlistButton handle={product.handle} title={product.title} className="h-14 w-14 shrink-0 border border-ink/15" />
        </div>
      )}

      {/* Promises */}
      <ul className="mt-8 grid gap-3 rounded-[1.25rem] bg-parchment/50 p-5 text-sm">
        <li className="flex items-center gap-3">
          <TruckIcon size={18} className="text-burgundy" />
          {commerce.freeShippingThreshold > 0 ? <>Free shipping over {money(commerce.freeShippingThreshold)}; otherwise {money(commerce.standardShippingRate)}.</> : <>Standard shipping {money(commerce.standardShippingRate)}.</>}
        </li>
        <li className="flex items-center gap-3">
          <ReturnIcon size={18} className="text-burgundy" /> {commerce.returnWindowDays}-day returns from your account.
        </li>
        <li className="flex items-center gap-3">
          <NeedleIcon size={18} className="text-burgundy" /> Finished by hand in small batches.
        </li>
      </ul>

      <div className="mt-8">
        <AccordionItem title="Description" defaultOpen>
          <p>{product.description}</p>
        </AccordionItem>
        {product.details.fabric || product.details.fit || product.details.features?.length ? (
          <AccordionItem title="Fabric & fit">
            <dl className="space-y-2">
              {product.details.fabric ? (
                <div>
                  <dt className="inline font-medium">Fabric: </dt>
                  <dd className="inline">{product.details.fabric}</dd>
                </div>
              ) : null}
              {product.details.fit ? (
                <div>
                  <dt className="inline font-medium">Fit: </dt>
                  <dd className="inline">{product.details.fit}</dd>
                </div>
              ) : null}
              {product.details.sustainability ? (
                <div>
                  <dt className="inline font-medium">Sourcing: </dt>
                  <dd className="inline">{product.details.sustainability}</dd>
                </div>
              ) : null}
            </dl>
            {product.details.features?.length ? (
              <ul className="mt-4 list-disc space-y-1 pl-5">
                {product.details.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            ) : null}
          </AccordionItem>
        ) : null}
        <AccordionItem title="Care">
          <p>{product.details.care || 'Hand wash cold and dry flat, away from direct heat. Fold, never hang, to keep the shape.'}</p>
          <Link href="/care-instructions" className="link-wipe mt-3 inline-block">
            Our full care guide
          </Link>
        </AccordionItem>
        <AccordionItem title="Shipping & returns">
          <p>
            Standard delivery {money(commerce.standardShippingRate)}
            {commerce.freeShippingThreshold > 0 ? <>, free over {money(commerce.freeShippingThreshold)}</> : null}; express {money(commerce.expressShippingRate)}. Returns are accepted within {commerce.returnWindowDays} days of delivery — start one from your account.
          </p>
          <Link href="/shipping-returns" className="link-wipe mt-3 inline-block">
            Shipping & returns policy
          </Link>
        </AccordionItem>
      </div>

      <Overlay open={guide} onClose={() => setGuide(false)} label="Size guide" side="right" className="bg-ivory text-ink">
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <h2 className="font-display text-3xl">Size guide</h2>
          <CloseButton onClick={() => setGuide(false)} />
        </div>
        <div className="p-6">
          {summary.count > 0 ? <FitMeter fit={summary.fit} /> : null}
          <SizeGuideTable highlight={variant?.size ?? null} />
        </div>
      </Overlay>
    </div>
  )
}

function StockAlertForm({ productId, variantId, label, onDone }: { productId: string; variantId: string | null; label: string; onDone: () => void }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  return state === 'done' ? (
    <p className="mt-8 rounded-2xl bg-success/10 p-4 text-sm text-success" role="status">
      You are on the list — we will let you know when {label} is back in stock.
    </p>
  ) : (
    <form
      className="mt-8 space-y-3 rounded-[1.25rem] border border-ink/10 p-5"
      onSubmit={async (e) => {
        e.preventDefault()
        setState('busy')
        setError(null)
        try {
          await api('/api/stock-alerts', { body: { productId, variantId, email } })
          setState('done')
          onDone()
        } catch (err) {
          setState('idle')
          setError(err instanceof ApiError ? err.message : 'Please try again.')
        }
      }}
    >
      <p className="font-display text-2xl leading-tight">Sold out in this size</p>
      <p className="text-sm text-stone">Leave your email and we will let you know when it is back.</p>
      <Field label="Email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error ?? undefined} />
      <Button type="submit" block loading={state === 'busy'}>
        Notify me
      </Button>
    </form>
  )
}

export function FitMeter({ fit }: { fit: RatingSummary['fit'] }) {
  const total = fit.small + fit.true + fit.large
  if (!total) return null
  const score = (fit.large - fit.small) / total // -1 small … +1 large
  return (
    <div className="mb-8">
      <p className="text-eyebrow text-stone">How it fits — from {total} review{total === 1 ? '' : 's'}</p>
      <div className="relative mt-4 h-1 rounded-full bg-ink/10">
        <span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-burgundy ring-4 ring-ivory" style={{ left: `${50 + score * 50}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs text-stone">
        <span>Runs small</span>
        <span>True to size</span>
        <span>Runs large</span>
      </div>
    </div>
  )
}
