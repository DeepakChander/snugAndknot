'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useUIStore } from '@/stores/ui-store'
import { useHydrated } from '@/hooks/use-hydrated'
import { ProductPrice } from '@/components/kit/Price'
import { Stars } from '@/components/kit/Stars'
import { HeartIcon, PlusIcon, XIcon } from '@/components/kit/icons'
import { cn, discountPercent } from '@/lib/format'
import type { Product } from '@/types/commerce'

export type CardProduct = Pick<
  Product,
  'id' | 'handle' | 'title' | 'price' | 'compareAtPrice' | 'prices' | 'images' | 'colors' | 'variants' | 'isNew' | 'bestseller' | 'rating' | 'reviewCount' | 'productType'
>

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
      className={cn('flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-70', tone === 'light' ? 'text-ink' : 'text-ivory', className)}
    >
      <HeartIcon size={18} filled={on} className={on ? 'text-ink' : undefined} />
    </button>
  )
}

/**
 * A product in a grid: the photograph (the second one fades in on hover), a small badge, the
 * wishlist heart, and sizes to add straight to the bag (on hover with a mouse; behind "+" on touch).
 * Under it the name, the price and the colours. Nothing slides or rises in.
 */
export default function ProductCard({
  product,
  priority = false,
  sizes = '(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw',
  className,
  aspect = 'aspect-[3/4]',
}: {
  product: CardProduct
  /** Kept for older call sites; cards no longer stagger in by position. */
  index?: number
  priority?: boolean
  sizes?: string
  className?: string
  aspect?: string
}) {
  const [quick, setQuick] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const [primary, secondary] = product.images
  const pct = discountPercent(product.price, product.compareAtPrice)
  const sizeVariants = product.variants.filter((v) => v.size)
  const soldOut = product.variants.length > 0 && product.variants.every((v) => !v.available)

  function add(variantId: string) {
    const v = product.variants.find((x) => x.id === variantId)
    if (!v || !v.available) return
    addItem({
      productId: product.id,
      variantId: v.id,
      handle: product.handle,
      title: product.title,
      image: primary?.src ?? '',
      price: v.price,
      size: v.size,
      color: v.color,
      quantity: 1,
    })
    setQuick(false)
    openCart()
  }

  const badge = soldOut ? 'Sold out' : pct > 0 ? `−${pct}%` : product.isNew ? 'New' : product.bestseller ? 'Bestseller' : ''

  return (
    <article onPointerLeave={() => setQuick(false)} className={cn('group/card relative', className)}>
      <div className={cn('relative overflow-hidden bg-bone', aspect)}>
        <Link href={`/product/${product.handle}`} className="absolute inset-0 z-[1]" aria-label={product.title}>
          {primary ? (
            <Image src={primary.src} alt={primary.alt || product.title} fill sizes={sizes} priority={priority} className="object-cover" />
          ) : null}
          {secondary ? (
            <Image src={secondary.src} alt="" fill sizes={sizes} className="object-cover opacity-0 transition-opacity duration-500 md:group-hover/card:opacity-100" />
          ) : null}
        </Link>

        {badge ? (
          <span
            className={cn(
              'pointer-events-none absolute left-0 top-3 z-[2] px-2 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em]',
              soldOut ? 'bg-ink text-ivory' : pct > 0 ? 'bg-ivory text-burgundy' : 'bg-ivory text-ink'
            )}
          >
            {badge}
          </span>
        ) : null}
        <WishlistButton handle={product.handle} title={product.title} className="absolute right-1.5 top-1.5 z-[2]" />

        {/* Sizes straight to the bag */}
        {!soldOut && sizeVariants.length ? (
          <>
            <div
              className={cn(
                'absolute inset-x-0 bottom-0 z-[2] bg-ivory/95 px-3 py-2.5 transition-opacity duration-200',
                quick ? 'opacity-100' : 'pointer-events-none opacity-0 md:group-hover/card:pointer-events-auto md:group-hover/card:opacity-100 md:group-focus-within/card:pointer-events-auto md:group-focus-within/card:opacity-100'
              )}
            >
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.14em] text-stone">Add to bag</p>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                {sizeVariants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    disabled={!v.available}
                    onClick={() => add(v.id)}
                    className="py-0.5 text-[0.78rem] font-medium hover:underline disabled:cursor-not-allowed disabled:text-ink/30 disabled:line-through"
                    aria-label={`Add size ${v.size} to bag${v.available ? '' : ' (sold out)'}`}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
            {!quick ? (
              <button
                type="button"
                onClick={() => setQuick(true)}
                className="absolute bottom-2 right-2 z-[2] flex h-9 w-9 items-center justify-center bg-ivory/95 text-ink md:hidden"
                aria-label={`Choose a size of ${product.title}`}
              >
                <PlusIcon size={14} />
              </button>
            ) : (
              <button type="button" onClick={() => setQuick(false)} className="absolute bottom-[3.6rem] right-2 z-[3] flex h-7 w-7 items-center justify-center bg-ivory text-ink md:hidden" aria-label="Close sizes">
                <XIcon size={12} />
              </button>
            )}
          </>
        ) : null}
      </div>

      <div className="mt-2.5">
        <Link href={`/product/${product.handle}`} className="block text-[0.86rem] leading-snug text-ink hover:underline hover:underline-offset-4">
          {product.title}
        </Link>
        <ProductPrice product={product} className="mt-1 block text-[0.86rem] font-medium" />
        <div className="mt-1.5 flex items-center gap-3">
          {product.colors.length > 1 ? (
            <span className="flex items-center gap-1" aria-label={`Colours: ${product.colors.map((c) => c.name).join(', ')}`}>
              {product.colors.slice(0, 5).map((c) => (
                <span key={c.name} className="h-2.5 w-2.5 ring-1 ring-ink/15" style={{ background: c.hex }} />
              ))}
              {product.colors.length > 5 ? <span className="ml-0.5 text-[0.65rem] text-stone">+{product.colors.length - 5}</span> : null}
            </span>
          ) : null}
          {product.reviewCount > 0 ? (
            <span className="flex items-center gap-1 text-[0.7rem] text-stone">
              <Stars value={product.rating} size={10} />({product.reviewCount})
            </span>
          ) : null}
        </div>
      </div>
    </article>
  )
}
