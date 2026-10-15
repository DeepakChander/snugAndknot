'use client'

import Image from 'next/image'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCartStore } from '@/stores/cart-store'
import { useMoney, useSettings, useCurrency } from '@/components/providers/SettingsProvider'
import { FreeShippingMeter } from '@/components/chrome/CartDrawer'
import { XIcon } from '@/components/kit/icons'
import { cn } from '@/lib/format'
import type { Quote } from '@/types/commerce'

export function CouponForm({ quote }: { quote: Quote | null }) {
  const couponCode = useCartStore((s) => s.couponCode)
  const setCouponCode = useCartStore((s) => s.setCouponCode)
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(!!couponCode)

  if (couponCode && quote?.coupon) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-dashed border-gold bg-gold/10 px-4 py-3 text-sm">
        <span>
          <span className="font-mono tracking-[0.1em]">{quote.coupon.code}</span>
          <span className="ml-2 text-stone">{quote.coupon.description}</span>
        </span>
        <button type="button" onClick={() => setCouponCode(null)} className="rounded-full p-1.5 hover:bg-ink/10" aria-label="Remove code">
          <XIcon size={12} />
        </button>
      </div>
    )
  }

  return (
    <div>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="link-wipe text-sm">
          Have a code?
        </button>
      ) : (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (value.trim()) setCouponCode(value)
          }}
        >
          <label htmlFor="coupon" className="sr-only">
            Discount code
          </label>
          <input
            id="coupon"
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
            placeholder="Discount code"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-full border border-ink/15 bg-transparent px-4 py-2.5 font-mono text-sm uppercase tracking-[0.08em] outline-none focus:border-ink/60"
          />
          <button type="submit" className="shrink-0 rounded-full bg-ink px-5 text-sm text-ivory hover:bg-burgundy">
            Apply
          </button>
        </form>
      )}
      <AnimatePresence>
        {couponCode && quote?.couponError ? (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="mt-2 flex items-center justify-between gap-2 text-xs text-error">
            <span>
              <span className="font-mono">{couponCode}</span>: {quote.couponError}
            </span>
            <button type="button" onClick={() => setCouponCode(null)} className="underline">
              Clear
            </button>
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default function OrderSummary({ quote, loading, compact = false, children }: { quote: Quote | null; loading: boolean; compact?: boolean; children?: React.ReactNode }) {
  const money = useMoney(quote?.currency)
  const { currency: cur } = useCurrency()
  const { commerce } = useSettings()
  const lines = quote?.lines ?? []
  return (
    <div className="rounded-[1.75rem] bg-bone/70 p-6 md:p-8">
      <h2 className="font-display text-3xl">Summary</h2>
      {!compact && lines.length ? (
        <ul className="mt-6 space-y-4 border-b border-ink/10 pb-6">
          {lines.map((l) => (
            <li key={l.id} className="flex items-center gap-4">
              <span className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-parchment">
                {l.image ? <Image src={l.image} alt="" fill sizes="64px" className="object-cover" /> : null}
                <span className="absolute -right-0 -top-0 flex h-5 min-w-5 items-center justify-center rounded-bl-lg bg-ink px-1 font-mono text-[10px] text-ivory">{l.quantity}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{l.title}</span>
                <span className="text-xs text-stone">{[l.size, l.color].filter(Boolean).join(' · ')}</span>
              </span>
              <span className="font-mono text-sm tabular-nums">{money(l.lineTotal)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-6">
        <CouponForm quote={quote} />
      </div>
      <dl className={cn('mt-6 space-y-3 text-sm transition-opacity', loading && 'opacity-50')}>
        <div className="flex justify-between">
          <dt className="text-stone">Subtotal</dt>
          <dd className="font-mono tabular-nums">{money(quote?.subtotal ?? 0)}</dd>
        </div>
        {quote?.discount ? (
          <div className="flex justify-between text-burgundy">
            <dt>Discount</dt>
            <dd className="font-mono tabular-nums">−{money(quote.discount)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="text-stone">Shipping</dt>
          <dd className="font-mono tabular-nums">{quote ? (quote.shipping ? money(quote.shipping) : 'Free') : '—'}</dd>
        </div>
        {commerce.taxRate > 0 ? (
          <div className="flex justify-between">
            <dt className="text-stone">Tax ({commerce.taxRate}%)</dt>
            <dd className="font-mono tabular-nums">{money(quote?.tax ?? 0)}</dd>
          </div>
        ) : null}
        <div className="flex items-baseline justify-between border-t border-ink/10 pt-4">
          <dt className="text-base">Total</dt>
          <dd className="font-mono text-2xl tabular-nums">{money(quote?.total ?? 0)}</dd>
        </div>
      </dl>
      {quote ? (
        <div className="mt-6">
          <FreeShippingMeter remaining={quote.freeShippingRemaining} threshold={cur.freeShippingThreshold} />
        </div>
      ) : null}
      {children ? <div className="mt-8">{children}</div> : null}
    </div>
  )
}
