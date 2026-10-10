'use client'

import { useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { getProductByHandle } from '@/lib/data'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import type { Product } from '@/types'

/* ──────────────────────────────────────────────────────────
   WISHLIST PAGE
   Displays saved products in a smart grid, with
   share and bulk-add-to-bag functionality
   ────────────────────────────────────────────────────────── */

export default function WishlistPage() {
  const { items: wishlistHandles, removeItem } = useWishlistStore()
  const { addItem: addCartItem } = useCartStore()
  const { isAuthenticated, openAuthModal } = useAuthStore()
  const addToast = useUIStore((s) => s.addToast)

  // Resolve product data from handles
  const products = useMemo(() => {
    return wishlistHandles
      .map((handle) => getProductByHandle(handle))
      .filter((p): p is Product => p !== undefined)
  }, [wishlistHandles])

  // --------------------------------------------------
  // Actions
  // --------------------------------------------------
  const handleShare = useCallback(async () => {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : ''
      await navigator.clipboard.writeText(url)
      addToast('Wishlist link copied to clipboard!', 'success')
    } catch {
      addToast('Could not copy link. Try again.', 'error')
    }
  }, [addToast])

  const handleAddAllToBag = useCallback(() => {
    if (!isAuthenticated) {
      openAuthModal('login')
      return
    }

    let addedCount = 0
    products.forEach((product) => {
      const variant = product.variants[0]
      if (variant && variant.available) {
        addCartItem({
          productId: product.id,
          variantId: variant.id,
          handle: product.handle,
          title: product.title,
          image: product.images[0]?.src || '/images/placeholder.jpg',
          price: variant.price,
          size: variant.size || 'One Size',
          color: variant.color || product.colors[0] || '',
          quantity: 1,
        })
        addedCount++
      }
    })

    if (addedCount > 0) {
      addToast(`${addedCount} ${addedCount === 1 ? 'item' : 'items'} added to your bag.`, 'success')
    } else {
      addToast('No available items to add.', 'info')
    }
  }, [products, isAuthenticated, openAuthModal, addCartItem, addToast])

  const handleAddSingleToBag = useCallback(
    (product: Product) => {
      const variant = product.variants[0]
      if (!variant || !variant.available) {
        addToast('This item is currently unavailable.', 'error')
        return
      }
      addCartItem({
        productId: product.id,
        variantId: variant.id,
        handle: product.handle,
        title: product.title,
        image: product.images[0]?.src || '/images/placeholder.jpg',
        price: variant.price,
        size: variant.size || 'One Size',
        color: variant.color || product.colors[0] || '',
        quantity: 1,
      })
      addToast(`${product.title} added to your bag.`, 'success')
    },
    [addCartItem, addToast]
  )

  const handleRemove = useCallback(
    (handle: string, title: string) => {
      removeItem(handle)
      addToast(`${title} removed from wishlist.`, 'info')
    },
    [removeItem, addToast]
  )

  // --------------------------------------------------
  // Render
  // --------------------------------------------------
  return (
    <div className="pt-24 pb-32 bg-ivory min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <FadeIn>
          <nav className="flex items-center gap-2 text-xs text-wine/50 mb-8">
            <Link href="/account" className="hover:text-burgundy transition-colors">
              Account
            </Link>
            <span>/</span>
            <span className="text-burgundy">Wishlist</span>
          </nav>
        </FadeIn>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 lg:mb-14">
          <div>
            <p className="text-xs font-semibold text-gold-muted uppercase tracking-[0.3em] mb-3">
              Saved Pieces
            </p>
            <TextReveal
              as="h1"
              className="text-4xl sm:text-5xl text-burgundy mb-2"
            >
              Your Wishlist
            </TextReveal>
            <FadeIn delay={0.15}>
              <p className="text-wine/70">
                {products.length} {products.length === 1 ? 'piece' : 'pieces'} saved
              </p>
            </FadeIn>
          </div>

          {/* Action buttons */}
          {products.length > 0 && (
            <FadeIn delay={0.2}>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase border border-burgundy/20 text-burgundy hover:bg-burgundy hover:text-gold transition-all duration-300"
                  aria-label="Share your wishlist"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" strokeLinecap="round" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" strokeLinecap="round" />
                  </svg>
                  Share Wishlist
                </button>
                <button
                  onClick={handleAddAllToBag}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold tracking-wider uppercase bg-burgundy text-gold hover:bg-burgundy-deep transition-all duration-300 hover:shadow-[0_8px_32px_-8px_rgba(91,14,20,0.4)]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
                    <path d="M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Add All to Bag
                </button>
              </div>
            </FadeIn>
          )}
        </div>

        {/* ═══════════════════════════════════════════
            EMPTY STATE
           ═══════════════════════════════════════════ */}
        {products.length === 0 ? (
          <FadeIn>
            <div className="flex flex-col items-center justify-center text-center py-24 border border-gold-muted/20 bg-parchment/30">
              {/* Heart icon */}
              <div className="w-20 h-20 mb-6 rounded-full bg-burgundy/5 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="w-10 h-10 text-burgundy/30"
                >
                  <path
                    d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="font-heading text-2xl text-burgundy mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-sm text-wine/60 mb-8 max-w-sm leading-relaxed">
                Start collecting pieces you love. Tap the heart icon on any
                product to save it here for later.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold tracking-wider uppercase bg-burgundy text-gold hover:bg-burgundy-deep transition-all duration-300 hover:shadow-[0_8px_32px_-8px_rgba(91,14,20,0.4)]"
              >
                Explore the Collection
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </FadeIn>
        ) : (
          /* ═══════════════════════════════════════════
              PRODUCT GRID
             ═══════════════════════════════════════════ */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
            {products.map((product, i) => (
              <FadeIn key={product.handle} delay={0.05 + i * 0.06}>
                <WishlistProductCard
                  product={product}
                  onAddToBag={handleAddSingleToBag}
                  onRemove={handleRemove}
                />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
   WISHLIST PRODUCT CARD
   Image, title, price, add-to-bag, remove
   ────────────────────────────────────────────────────────── */

function WishlistProductCard({
  product,
  onAddToBag,
  onRemove,
}: {
  product: Product
  onAddToBag: (product: Product) => void
  onRemove: (handle: string, title: string) => void
}) {
  const imageSrc = product.images[0]?.src || '/images/placeholder.jpg'
  const imageAlt = product.images[0]?.alt || product.title
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price

  return (
    <div className="group relative bg-ivory border border-gold-muted/15 transition-all duration-300 hover:shadow-[0_8px_32px_-12px_rgba(91,14,20,0.1)]">
      {/* Remove button */}
      <button
        onClick={() => onRemove(product.handle, product.title)}
        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-ivory/80 backdrop-blur-sm rounded-full text-burgundy/60 hover:text-error-garnet hover:bg-ivory transition-all duration-200"
        aria-label={`Remove ${product.title} from wishlist`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Image */}
      <Link href={`/product/${product.handle}`} className="block relative aspect-[3/4] overflow-hidden">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-700 ease-[var(--ease-yarn-pull)] group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-burgundy/0 group-hover:bg-burgundy/5 transition-colors duration-300" />

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.new && (
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase bg-burgundy text-gold">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-widest uppercase bg-error-garnet text-ivory">
              Sale
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/product/${product.handle}`}>
          <p className="text-xs text-wine/50 uppercase tracking-wider mb-1">
            {product.vendor}
          </p>
          <h3 className="font-heading text-base text-burgundy leading-snug mb-2 group-hover:text-burgundy-light transition-colors duration-200 line-clamp-2">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="font-mono text-sm font-bold text-burgundy">
            ${product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="font-mono text-xs text-wine/40 line-through">
              ${product.compareAtPrice!.toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to bag button */}
        <button
          onClick={() => onAddToBag(product)}
          className="w-full py-2.5 text-xs font-semibold tracking-wider uppercase border border-burgundy/20 text-burgundy hover:bg-burgundy hover:text-gold transition-all duration-300"
        >
          Add to Bag
        </button>
      </div>
    </div>
  )
}
