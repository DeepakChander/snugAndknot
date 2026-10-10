'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useUIStore } from '@/stores/ui-store'
import { useHydrated } from '@/hooks/use-hydrated'
import Price from '@/components/kit/Price'
import { Stars } from '@/components/kit/Stars'
import { HeartIcon, PlusIcon } from '@/components/kit/icons'
import { cn, discountPercent } from '@/lib/format'
import type { Product } from '@/types/commerce'

export type CardProduct = Pick<
  Product,
  'id' | 'handle' | 'title' | 'price' | 'compareAtPrice' | 'images' | 'colors' | 'variants' | 'isNew' | 'bestseller' | 'rating' | 'reviewCount' | 'productType'
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
      data-cursor="hover"
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-colors',
        tone === 'light' ? 'bg-ivory/70 text-ink hover:bg-ivory' : 'bg-noir/40 text-bone hover:bg-noir/60',
        className
      )}
    >
      <motion.span key={String(on)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
        <HeartIcon size={18} filled={on} className={on ? 'text-burgundy' : undefined} />
      </motion.span>
    </button>
  )
}

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
  const card = useRef<HTMLDivElement>(null)
  const [quick, setQuick] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const [primary, secondary] = product.images
  const pct = discountPercent(product.price, product.compareAtPrice)
  const sizeVariants = product.variants.filter((v) => v.size)
  const soldOut = product.variants.length > 0 && product.variants.every((v) => !v.available)

  function onMove(e: React.PointerEvent) {
    const el = card.current
    if (!el || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-y * 7).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(x * 9).toFixed(2)}deg`)
    el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`)
    el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`)
  }
  function onLeave() {
    const el = card.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    setQuick(false)
  }

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

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: (index % 4) * 0.08 }}
      className={cn('group/card relative', className)}
    >
      <div style={{ perspective: '1100px' }}>
        <div
          ref={card}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className={cn('relative overflow-hidden rounded-[1.25rem] bg-parchment transition-transform duration-500 ease-out [transform:rotateX(var(--rx,0))_rotateY(var(--ry,0))] [transform-style:preserve-3d]', aspect)}
        >
          <Link href={`/product/${product.handle}`} className="absolute inset-0 z-[1]" data-cursor="view" data-cursor-label="View" aria-label={product.title}>
            {primary ? (
              <Image
                src={primary.src}
                alt={primary.alt || product.title}
                fill
                sizes={sizes}
                priority={priority}
                className={cn('object-cover transition-[transform,opacity] duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover/card:scale-[1.06]', secondary && 'group-hover/card:opacity-0')}
              />
            ) : (
              <div className="knit-texture absolute inset-0 text-ink" />
            )}
            {secondary ? (
              <Image src={secondary.src} alt="" fill sizes={sizes} className="scale-[1.08] object-cover opacity-0 transition-[transform,opacity] duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover/card:scale-100 group-hover/card:opacity-100" />
            ) : null}
            {/* Light sheen that follows the pointer */}
            <span className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover/card:opacity-100 [background:radial-gradient(circle_at_var(--gx,50%)_var(--gy,50%),rgba(255,255,255,.55),transparent_45%)]" />
          </Link>

          <div className="pointer-events-none absolute left-3 top-3 z-[2] flex flex-col items-start gap-1.5">
            {soldOut ? <span className="rounded-full bg-noir px-2.5 py-1 text-eyebrow text-bone">Sold out</span> : null}
            {!soldOut && product.isNew ? <span className="rounded-full bg-ivory/85 px-2.5 py-1 text-eyebrow text-ink backdrop-blur">New</span> : null}
            {!soldOut && pct > 0 ? <span className="rounded-full bg-burgundy px-2.5 py-1 text-eyebrow text-ivory">−{pct}%</span> : null}
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
                    className="rounded-2xl bg-ivory/90 p-2 backdrop-blur-md"
                  >
                    <p className="px-1 pb-1.5 text-eyebrow text-stone">Add size</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sizeVariants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          disabled={!v.available}
                          onClick={() => add(v.id)}
                          data-cursor="hover"
                          className="min-w-10 rounded-full border border-ink/15 px-2.5 py-1.5 font-mono text-xs transition-colors hover:bg-ink hover:text-ivory disabled:cursor-not-allowed disabled:opacity-30 disabled:line-through"
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
                  className="ml-auto flex h-10 items-center gap-2 rounded-full bg-ivory/85 px-3 text-xs backdrop-blur-md transition-all duration-500 hover:bg-ivory md:translate-y-3 md:opacity-0 md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100"
                  aria-label={`Quick add ${product.title}`}
                >
                  <PlusIcon size={14} /> <span className="hidden sm:inline">Quick add</span>
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/product/${product.handle}`} className="block font-display text-[1.45rem] leading-[1.05] tracking-[-0.01em] transition-colors hover:text-burgundy">
            {product.title}
          </Link>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-stone">
            <span>{product.productType}</span>
            {product.colors.length ? (
              <span className="flex items-center gap-1" aria-label={`Colours: ${product.colors.map((c) => c.name).join(', ')}`}>
                {product.colors.slice(0, 4).map((c) => (
                  <span key={c.name} className="h-2.5 w-2.5 rounded-full ring-1 ring-ink/15" style={{ background: c.hex }} />
                ))}
              </span>
            ) : null}
          </div>
          {product.reviewCount > 0 ? (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-stone">
              <Stars value={product.rating} size={11} />
              <span>({product.reviewCount})</span>
            </div>
          ) : null}
        </div>
        <Price price={product.price} compareAt={product.compareAtPrice} className="shrink-0 pt-1 text-sm" />
      </div>
    </motion.article>
  )
}
