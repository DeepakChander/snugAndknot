'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { useCartStore } from '@/stores/cart-store'
import { useCartQuote } from '@/hooks/use-cart-quote'
import { useHydrated } from '@/hooks/use-hydrated'
import { useMoney, useNavData, useSettings } from '@/components/providers/SettingsProvider'
import Overlay, { CloseButton } from '@/components/kit/Overlay'
import { ButtonLink } from '@/components/kit/Button'
import { BagIcon, MinusIcon, PlusIcon } from '@/components/kit/icons'

const EASE = [0.16, 1, 0.3, 1] as const

export function QtyStepper({ value, onChange, max = 10, label }: { value: number; onChange: (n: number) => void; max?: number; label: string }) {
  return (
    <div className="inline-flex h-9 items-center rounded-full border border-ink/15" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" onClick={() => onChange(value - 1)} aria-label="Decrease quantity" data-cursor="hover" className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-ink/5">
        <MinusIcon size={14} />
      </button>
      <span className="w-6 text-center font-mono text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
        data-cursor="hover"
        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-ink/5 disabled:opacity-30"
      >
        <PlusIcon size={14} />
      </button>
    </div>
  )
}

export function FreeShippingMeter({ remaining, threshold }: { remaining: number; threshold: number }) {
  const money = useMoney()
  if (threshold <= 0) return null
  const pct = Math.min(100, ((threshold - remaining) / threshold) * 100)
  return (
    <div>
      <p className="text-sm">
        {remaining > 0 ? (
          <>
            You are <span className="font-mono">{money(remaining)}</span> away from complimentary shipping.
          </>
        ) : (
          <>Complimentary shipping unlocked.</>
        )}
      </p>
      <div className="relative mt-3 h-[3px] overflow-hidden rounded-full bg-ink/10">
        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-deep to-gold" initial={false} animate={{ width: `${pct}%` }} transition={{ duration: 1, ease: EASE }} />
      </div>
    </div>
  )
}

export default function CartDrawer() {
  const hydrated = useHydrated()
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore()
  const { quote, loading, notices } = useCartQuote({ enabled: isOpen })
  const settings = useSettings()
  const nav = useNavData()
  const money = useMoney()
  const lines = hydrated ? items : []
  const count = lines.reduce((s, i) => s + i.quantity, 0)
  const localSubtotal = lines.reduce((s, i) => s + i.price * i.quantity, 0)
  const subtotal = quote?.subtotal ?? localSubtotal
  const remaining = quote?.freeShippingRemaining ?? Math.max(0, settings.commerce.freeShippingThreshold - localSubtotal)

  return (
    <Overlay open={isOpen} onClose={closeCart} label="Shopping bag" side="right" className="flex flex-col bg-ivory text-ink">
      <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
        <div className="flex items-baseline gap-3">
          <h2 className="font-display text-3xl">Your bag</h2>
          <span className="font-mono text-sm text-stone">({count})</span>
        </div>
        <CloseButton onClick={closeCart} />
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-parchment text-burgundy">
            <BagIcon size={40} />
          </span>
          <h3 className="mt-6 font-display text-4xl">Your bag is empty</h3>
          <p className="mt-3 max-w-xs text-stone">Begin with a piece made slowly, to be worn for years.</p>
          <ButtonLink href="/shop" onClick={closeCart} className="mt-8" arrow>
            Explore the collection
          </ButtonLink>
          {nav.spotlight.length ? (
            <div className="mt-12 w-full text-left">
              <p className="text-eyebrow text-stone">You may like</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {nav.spotlight.slice(0, 2).map((p) => (
                  <Link key={p.handle} href={`/product/${p.handle}`} onClick={closeCart} className="group">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-parchment">
                      {p.images[0] ? <Image src={p.images[0].src} alt={p.images[0].alt} fill sizes="200px" className="object-cover transition-transform duration-700 group-hover:scale-105" /> : null}
                    </div>
                    <p className="mt-2 truncate text-sm">{p.title}</p>
                    <p className="font-mono text-xs text-stone">{money(p.price)}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="border-b border-ink/10 px-6 py-5">
            <FreeShippingMeter remaining={remaining} threshold={settings.commerce.freeShippingThreshold} />
          </div>

          <AnimatePresence initial={false}>
            {notices.length ? (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-burgundy/[0.06] px-6" role="status">
                <ul className="space-y-1 py-3 text-sm text-burgundy">
                  {notices.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-6" data-lenis-prevent>
            <AnimatePresence initial={false}>
              {lines.map((item) => (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 60, height: 0, paddingTop: 0, paddingBottom: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="flex gap-4 py-5"
                >
                  <Link href={`/product/${item.handle}`} onClick={closeCart} className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-parchment">
                    {item.image ? <Image src={item.image} alt={item.title} fill sizes="96px" className="object-cover" /> : null}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/product/${item.handle}`} onClick={closeCart} className="font-display text-xl leading-tight hover:text-burgundy">
                        {item.title}
                      </Link>
                      <span className="font-mono text-sm tabular-nums">{money(item.price * item.quantity)}</span>
                    </div>
                    <p className="mt-1 text-label text-stone">{[item.size, item.color].filter(Boolean).join(' · ')}</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QtyStepper value={item.quantity} onChange={(n) => updateQuantity(item.id, n)} label={item.title} />
                      <button type="button" onClick={() => removeItem(item.id)} className="link-wipe text-xs text-stone hover:text-ink">
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="border-t border-ink/10 bg-bone/60 px-6 pb-6 pt-5">
            <div className="flex items-baseline justify-between">
              <span className="text-label text-stone">Subtotal</span>
              <span className={`font-mono text-xl tabular-nums transition-opacity ${loading ? 'opacity-50' : ''}`}>{money(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-stone">Shipping, taxes and codes are calculated at checkout.</p>
            <div className="mt-5 grid gap-2">
              <ButtonLink href="/checkout" onClick={closeCart} size="lg" block arrow>
                Checkout
              </ButtonLink>
              <ButtonLink href="/cart" onClick={closeCart} variant="outline" size="md" block>
                View bag
              </ButtonLink>
            </div>
          </div>
        </>
      )}
    </Overlay>
  )
}
