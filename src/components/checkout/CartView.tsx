'use client'

import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useUIStore } from '@/stores/ui-store'
import { useCartQuote } from '@/hooks/use-cart-quote'
import { useHydrated } from '@/hooks/use-hydrated'
import { useMoney } from '@/components/providers/SettingsProvider'
import { ButtonLink } from '@/components/kit/Button'
import { QtyStepper } from '@/components/chrome/CartDrawer'
import ProductCard, { type CardProduct } from '@/components/store/ProductCard'
import OrderSummary from './OrderSummary'

export default function CartView({ suggestions }: { suggestions: CardProduct[] }) {
  const hydrated = useHydrated()
  const items = useCartStore((s) => s.items)
  const { updateQuantity, removeItem } = useCartStore()
  const addWish = useWishlistStore((s) => s.addItem)
  const addToast = useUIStore((s) => s.addToast)
  const { quote, loading, notices } = useCartQuote()
  const money = useMoney(quote?.currency)
  const lines = hydrated ? items : []
  const count = lines.reduce((s, l) => s + l.quantity, 0)

  return (
    <div className="bg-ivory pb-28 pt-nav text-ink">
      <div className="container-wide pt-10 md:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-display">
            Your bag
          </h1>
          <p className="font-mono text-sm text-stone">
            {count} piece{count === 1 ? '' : 's'}
          </p>
        </div>

        {!hydrated ? (
          <div className="mt-14 h-64 skeleton" />
        ) : lines.length === 0 ? (
          <div className="mt-14 bg-bone/70 px-6 py-20 text-center">
            <p className="text-[1.6rem] font-medium">Your bag is empty.</p>
            <p className="mx-auto mt-4 max-w-md text-stone">Begin with a cardigan or a fine-gauge tee — every piece is made in small numbers.</p>
            <ButtonLink href="/shop" className="mt-8" arrow>
              Shop the collection
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_420px]">
            <div>
              <AnimatePresence initial={false}>
                {notices.length ? (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-6 space-y-1 overflow-hidden bg-burgundy/[0.06] p-4 text-sm text-burgundy" role="status">
                    {notices.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </motion.ul>
                ) : null}
              </AnimatePresence>
              <ul className="divide-y divide-ink/10 border-y border-ink/10">
                <AnimatePresence initial={false}>
                  {lines.map((l) => (
                    <motion.li key={l.id} layout exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex gap-5 py-7 md:gap-8">
                      <Link href={`/product/${l.handle}`} className="relative aspect-[3/4] w-28 shrink-0 overflow-hidden bg-parchment md:w-40">
                        {l.image ? <Image src={l.image} alt={l.title} fill sizes="160px" className="object-cover" /> : null}
                      </Link>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <Link href={`/product/${l.handle}`} className="text-[1.05rem] font-medium leading-snug hover:underline md:text-3xl">
                              {l.title}
                            </Link>
                            <p className="mt-1 text-label text-stone">{[l.size, l.color].filter(Boolean).join(' · ')}</p>
                            <p className="mt-2 font-mono text-sm text-stone">{money(l.price)} each</p>
                          </div>
                          <span className="font-mono text-lg tabular-nums">{money(l.price * l.quantity)}</span>
                        </div>
                        <div className="mt-auto flex flex-wrap items-center gap-5 pt-5">
                          <QtyStepper value={l.quantity} onChange={(n) => updateQuantity(l.id, n)} label={l.title} />
                          <button
                            type="button"
                            onClick={() => {
                              addWish(l.handle)
                              removeItem(l.id)
                              addToast(`${l.title} moved to your wishlist`, 'success', { label: 'View', href: '/account/wishlist' })
                            }}
                            className="link-wipe text-sm text-stone hover:text-ink"
                          >
                            Save for later
                          </button>
                          <button type="button" onClick={() => removeItem(l.id)} className="link-wipe text-sm text-stone hover:text-ink">
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
              <Link href="/shop" className="link-wipe mt-6 inline-block text-sm">
                ← Continue shopping
              </Link>
            </div>
            <div className="lg:sticky lg:top-[calc(var(--nav-offset)+1.5rem)] lg:self-start">
              <OrderSummary quote={quote} loading={loading} compact>
                <ButtonLink href="/checkout" size="lg" block arrow magnetic>
                  Checkout
                </ButtonLink>
                <p className="mt-3 text-center text-xs text-stone">Pay on delivery. Shipping is calculated at checkout.</p>
              </OrderSummary>
            </div>
          </div>
        )}
      </div>

      {suggestions.length ? (
        <section className="container-wide mt-28" aria-label="You may also like">
          <h2 className="text-headline">You may also like</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-14 md:gap-x-6 lg:grid-cols-4">
            {suggestions.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
