'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useUIStore } from '@/stores/ui-store'
import { useHydrated } from '@/hooks/use-hydrated'
import { ProductPrice } from '@/components/kit/Price'
import { useVariantPrice } from '@/components/providers/SettingsProvider'
import { Stars } from '@/components/kit/Stars'
import { HeartIcon, PlusIcon, XIcon } from '@/components/kit/icons'
import { cn, discountPercent } from '@/lib/format'
import type { Product } from '@/types/commerce'

export type CardProduct = Pick<
  Product,
  'id' | 'handle' | 'title' | 'price' | 'compareAtPrice' | 'prices' | 'images' | 'colors' | 'variants' | 'isNew' | 'bestseller' | 'rating' | 'reviewCount' | 'productType'
>

/** Backgrounds a card shows while its photograph loads, so a grid reads as colour, not grey boxes. */
const TONES = ['bg-parchment', 'bg-butter/60', 'bg-sage/50', 'bg-clay/50']

export function WishlistButton({ handle, title, className, tone = 'light' }: { handle: string; title: string; className?: string; tone?: 'light' | 'dark' }) {
  const hydrated = useHydrated()
  const active = useWishlistStore((s) => s.items.includes(handle))
  const toggle = useWishlistStore((s) => s.toggleItem)
  const addToast = useUIStore((s) => s.addToast)
  const on = hydrated && active
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(handle)
        addToast(on ? `Removed ${title} from your wishlist` : `Saved ${title} to your wishlist`, 'success', on ? undefined : { label: 'View', href: '/account/wishlist' })
      }}
      aria-pressed={on}
      aria-label={on ? `Remove ${title} from wishlist` : `Save ${title} to wishlist`}
      data-cursor="hover"
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-colors',
        tone === 'light' ? 'bg-ivory/70 text-ink hover:bg-ivory' : 'bg-noir/40 text-bone hover:bg-noir/60',
        className
      )}
    >
      <motion.span key={String(on)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
        <HeartIcon size={18} filled={on} className={on ? 'text-signal' : undefined} />
      </motion.span>
    </button>
  )
}

/** Small square labels on the photograph. */
const BADGE = 'px-2 py-1 text-[0.62rem] font-medium uppercase tracking-[0.12em]'

export default function ProductCard({
  product,
  index = 0,
  priority = false,
  sizes = '(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw',
  className,
  aspect = 'aspect-[3/4]',
}: {
  product: CardProduct
  index?: number
  priority?: boolean
  sizes?: string
  className?: string
  aspect?: string
}) {
  const [quick, setQuick] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const variantPrice = useVariantPrice()
  const [primary, secondary] = product.images
  const pct = discountPercent(product.price, product.compareAtPrice)
  const sizeVariants = product.variants.filter((v) => v.size)
  const soldOut = product.variants.length > 0 && product.variants.every((v) => !v.available)
  const tone = TONES[index % TONES.length]

  function add(variantId: string) {
    const v = product.variants.find((x) => x.id === variantId)
    // In the shopper's currency; a piece with no price in it cannot be added.
    const priced = v ? variantPrice(product, v) : null
    if (!v || !v.available || !priced) return
    addItem({
      productId: product.id,
      variantId: v.id,
      handle: product.handle,
      title: product.title,
      image: primary?.src ?? '',
      price: priced.price,
      size: v.size,
      color: v.color,
      quantity: 1,
    })
    setQuick(false)
    openCart()
  }

  return (
    <motion.article
      // The first cards are part of the first paint (they are the page's largest image); later ones rise in.
      initial={priority ? false : { opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: (index % 4) * 0.08 }}
      onPointerLeave={() => setQuick(false)}
      className={cn('group/card relative', className)}
    >
      <div className={cn('relative overflow-hidden', tone, aspect)}>
        <Link href={`/product/${product.handle}`} className="absolute inset-0 z-[1]" data-cursor="view" data-cursor-label="View" aria-label={product.title}>
          {primary ? (
            <Image
              src={primary.src}
              alt={primary.alt || product.title}
              fill
              sizes={sizes}
              priority={priority}
              className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover/card:scale-[1.04]"
            />
          ) : (
            <div className="knit-texture absolute inset-0 text-ink" />
          )}
          {/* The second photograph wipes up from the bottom edge on hover */}
          {secondary ? (
            <span className="absolute inset-0 transition-[clip-path] duration-[900ms] ease-[cubic-bezier(.76,0,.24,1)] [clip-path:inset(100%_0_0_0)] group-hover/card:[clip-path:inset(0_0_0_0)]">
              <Image src={secondary.src} alt="" fill sizes={sizes} className="scale-[1.12] object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover/card:scale-100" />
            </span>
          ) : null}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 z-[2] flex flex-col items-start gap-1.5">
          {soldOut ? <span className={cn(BADGE, 'bg-ink text-bone')}>Sold out</span> : null}
          {!soldOut && product.isNew ? <span className={cn(BADGE, 'bg-bone text-ink')}>New</span> : null}
          {!soldOut && pct > 0 ? <span className={cn(BADGE, 'bg-burgundy text-bone')}>−{pct}%</span> : null}
          {!soldOut && !product.isNew && !(pct > 0) && product.bestseller ? <span className={cn(BADGE, 'bg-bone text-ink')}>Bestseller</span> : null}
        </div>
        <WishlistButton handle={product.handle} title={product.title} className="absolute right-3 top-3 z-[2]" />

        {/* Quick add */}
        {!soldOut && sizeVariants.length ? (
          <div className="absolute inset-x-3 bottom-3 z-[2]">
            <AnimatePresence>
              {quick ? (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-ink p-2 text-bone"
                >
                  <div className="flex items-center justify-between px-1 pb-2">
                    <p className="text-[0.68rem] uppercase tracking-[0.14em] text-bone/60">Pick a size</p>
                    <button type="button" onClick={() => setQuick(false)} className="rounded-full p-1 text-bone/60 hover:text-bone" aria-label="Close sizes">
                      <XIcon size={12} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sizeVariants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        disabled={!v.available}
                        onClick={() => add(v.id)}
                        data-cursor="hover"
                        className="min-w-10 bg-bone/10 px-2.5 py-1.5 text-xs transition-colors hover:bg-bone hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:line-through"
                        aria-label={`Add size ${v.size} to bag${v.available ? '' : ' (sold out)'}`}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
            {!quick ? (
              <button
                type="button"
                onClick={() => setQuick(true)}
                data-cursor="hover"
                className="ml-auto flex h-10 items-center gap-2 bg-ink px-3.5 text-[0.72rem] font-medium uppercase tracking-[0.12em] text-bone transition-all duration-500 hover:bg-burgundy-deep md:translate-y-3 md:opacity-0 md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100"
                aria-label={`Quick add ${product.title}`}
              >
                <PlusIcon size={13} /> <span className="hidden sm:inline">Quick add</span>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-3.5">
        <div className="flex items-center justify-between gap-3 text-[0.68rem] uppercase tracking-[0.14em] text-stone">
          <span className="truncate">{product.productType}</span>
          {product.colors.length ? (
            <span className="flex shrink-0 items-center gap-1" aria-label={`Colours: ${product.colors.map((c) => c.name).join(', ')}`}>
              {product.colors.slice(0, 4).map((c) => (
                <span key={c.name} className="h-2.5 w-2.5 rounded-full ring-1 ring-ink/15" style={{ background: c.hex }} />
              ))}
              {product.colors.length > 4 ? <span className="ml-0.5 text-[0.65rem]">+{product.colors.length - 4}</span> : null}
            </span>
          ) : null}
        </div>
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <Link
            href={`/product/${product.handle}`}
            className="min-w-0 text-[0.95rem] leading-snug text-ink [background:linear-gradient(currentColor,currentColor)_0_100%/0_1px_no-repeat] transition-[background-size] duration-500 group-hover/card:[background-size:100%_1px]"
          >
            {product.title}
          </Link>
          <ProductPrice product={product} className="shrink-0 text-[0.9rem]" />
        </div>
        {product.reviewCount > 0 ? (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-stone">
            <Stars value={product.rating} size={11} />
            <span className="font-mono">({product.reviewCount})</span>
          </div>
        ) : null}
      </div>
    </motion.article>
  )
}
