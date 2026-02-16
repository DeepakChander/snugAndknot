'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { formatPrice, getDiscountPercentage } from '@/lib/utils'
import { getColorHex } from '@/lib/colors'
import Badge from '@/components/ui/Badge'
import type { Product } from '@/types'

gsap.registerPlugin(ScrollTrigger)

interface ProductCardProps {
  product: Product
  index?: number
  priority?: boolean
}

export default function ProductCard({ product, index = 0, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const toggleWishlist = useWishlistStore((s) => s.toggleItem)
  const hasWishlist = useWishlistStore((s) => s.hasItem)
  const addToCart = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const addToast = useUIStore((s) => s.addToast)
  const isWishlisted = hasWishlist(product.handle)
  const reducedMotion = useReducedMotion()

  // GSAP ScrollTrigger entrance animation
  useEffect(() => {
    if (reducedMotion || !cardRef.current) return
    const el = cardRef.current

    gsap.set(el, { opacity: 0, y: 30 })
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      delay: index * 0.08,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill()
      })
    }
  }, [index, reducedMotion])

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const variant = product.variants[0]
    if (!variant) return
    addToCart({
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
    addToast(`${product.title} added to bag`)
    openCart()
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.handle)
    addToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <div
      ref={cardRef}
      style={reducedMotion ? undefined : { opacity: 0 }}
    >
      <Link
        href={`/product/${product.handle}`}
        className="group block relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-parchment overflow-hidden mb-3">
          {/* Gold border draw animation on hover */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {/* Top border */}
            <span
              className="absolute top-0 left-0 h-[2px] bg-gold transition-all duration-500 ease-[var(--ease-yarn-pull)]"
              style={{ width: isHovered ? '100%' : '0%' }}
            />
            {/* Right border */}
            <span
              className="absolute top-0 right-0 w-[2px] bg-gold transition-all duration-500 ease-[var(--ease-yarn-pull)]"
              style={{
                height: isHovered ? '100%' : '0%',
                transitionDelay: isHovered ? '0.1s' : '0s',
              }}
            />
            {/* Bottom border */}
            <span
              className="absolute bottom-0 right-0 h-[2px] bg-gold transition-all duration-500 ease-[var(--ease-yarn-pull)]"
              style={{
                width: isHovered ? '100%' : '0%',
                transitionDelay: isHovered ? '0.2s' : '0s',
                transformOrigin: 'right',
              }}
            />
            {/* Left border */}
            <span
              className="absolute bottom-0 left-0 w-[2px] bg-gold transition-all duration-500 ease-[var(--ease-yarn-pull)]"
              style={{
                height: isHovered ? '100%' : '0%',
                transitionDelay: isHovered ? '0.3s' : '0s',
                transformOrigin: 'bottom',
              }}
            />
          </div>

          {/* Primary image */}
          <Image
            src={product.images[0]?.src || '/images/placeholder.jpg'}
            alt={product.images[0]?.alt || product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-700 ease-[var(--ease-loom-settle)] ${
              isHovered && product.images[1]
                ? 'opacity-0 scale-105'
                : 'opacity-100 scale-100'
            }`}
            priority={priority}
          />

          {/* Secondary image (hover) with clip-path reveal */}
          {product.images[1] && (
            <Image
              src={product.images[1].src}
              alt={product.images[1].alt || `${product.title} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-all duration-700 ease-[var(--ease-loom-settle)]"
              style={{
                clipPath: isHovered
                  ? 'circle(150% at 50% 50%)'
                  : 'circle(0% at 50% 50%)',
              }}
            />
          )}

          {/* Subtle burgundy gradient overlay on hover */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-burgundy-deep/40 via-transparent to-transparent transition-opacity duration-500 pointer-events-none"
            style={{ opacity: isHovered ? 1 : 0 }}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
            {product.new && (
              <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-gold text-burgundy">
                New
              </span>
            )}
            {product.bestseller && (
              <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-rosewood text-gold-pale">
                Bestseller
              </span>
            )}
            {product.compareAtPrice && (
              <span className="inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-gold text-burgundy">
                -{getDiscountPercentage(product.price, product.compareAtPrice)}%
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-ivory/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-ivory"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isWishlisted ? 'var(--color-gold)' : 'none'}
              stroke={isWishlisted ? 'var(--color-gold)' : 'var(--color-burgundy)'}
              strokeWidth="1.5"
              className="transition-all duration-300"
              style={{
                filter: isWishlisted ? 'drop-shadow(0 0 4px rgba(241,225,148,0.5))' : 'none',
              }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>

          {/* Quick add -- slide-up on hover */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20 p-3 transition-all duration-400 ease-[var(--ease-loom-settle)]"
            style={{
              transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
              opacity: isHovered ? 1 : 0,
            }}
          >
            <button
              onClick={handleQuickAdd}
              className="w-full py-2.5 bg-burgundy text-gold-pale text-xs font-semibold uppercase tracking-wider rounded-none transition-all duration-300 hover:bg-burgundy-deep hover:shadow-lg"
              style={{
                boxShadow: '0 -4px 20px rgba(91,14,20,0.15)',
              }}
            >
              Quick Add
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-1 px-0.5">
          {/* Category */}
          <p className="text-[10px] text-dust uppercase tracking-[0.2em] font-medium">
            {product.category}
          </p>

          {/* Title */}
          <h3 className="text-sm font-medium text-burgundy group-hover:text-wine transition-colors duration-300 line-clamp-1">
            {product.title}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span
              className="font-mono text-sm font-medium"
              style={{ color: product.compareAtPrice ? 'var(--color-gold)' : 'var(--color-wine)' }}
            >
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && (
              <span className="font-mono text-xs text-dust line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Color dots */}
          {product.colors.length > 1 && (
            <div className="flex items-center gap-1.5 pt-1">
              {product.colors.slice(0, 4).map((color) => (
                <span
                  key={color}
                  className="w-3 h-3 rounded-full border border-silk transition-transform duration-200 hover:scale-125"
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[10px] text-dust font-medium">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

