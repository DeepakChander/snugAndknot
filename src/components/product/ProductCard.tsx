'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { formatPrice, getDiscountPercentage } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  index?: number
  priority?: boolean
}

export default function ProductCard({ product, index = 0, priority = false }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const toggleWishlist = useWishlistStore((s) => s.toggleItem)
  const hasWishlist = useWishlistStore((s) => s.hasItem)
  const addToCart = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const addToast = useUIStore((s) => s.addToast)
  const isWishlisted = hasWishlist(product.handle)

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
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/product/${product.handle}`}
        className="group block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative aspect-[3/4] bg-cream-dark rounded-lg overflow-hidden mb-3">
          {/* Primary image */}
          <Image
            src={product.images[0]?.src || '/images/placeholder.jpg'}
            alt={product.images[0]?.alt || product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-opacity duration-500 ${isHovered && product.images[1] ? 'opacity-0' : 'opacity-100'}`}
            priority={priority}
          />
          {/* Secondary image (hover) */}
          {product.images[1] && (
            <Image
              src={product.images[1].src}
              alt={product.images[1].alt || `${product.title} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.new && <Badge variant="new">New</Badge>}
            {product.bestseller && <Badge variant="bestseller">Bestseller</Badge>}
            {product.compareAtPrice && (
              <Badge variant="sale">-{getDiscountPercentage(product.price, product.compareAtPrice)}%</Badge>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-cream/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isWishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
              className={isWishlisted ? 'text-terracotta' : 'text-charcoal'}
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>

          {/* Quick add */}
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={handleQuickAdd}
              className="w-full py-2.5 bg-charcoal/90 backdrop-blur-sm text-cream text-xs font-medium rounded-full hover:bg-charcoal transition-colors"
            >
              Quick Add
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <p className="text-[11px] text-earth uppercase tracking-wider">{product.category}</p>
          <h3 className="text-sm font-medium text-charcoal group-hover:text-terracotta transition-colors line-clamp-1">
            {product.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-charcoal">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="font-mono text-xs text-earth line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          {/* Color dots */}
          {product.colors.length > 1 && (
            <div className="flex gap-1 pt-1">
              {product.colors.slice(0, 4).map((color) => (
                <span
                  key={color}
                  className="w-3 h-3 rounded-full border border-beige"
                  style={{ backgroundColor: getColorHex(color) }}
                  title={color}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[10px] text-earth">+{product.colors.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

function getColorHex(name: string): string {
  const map: Record<string, string> = {
    'Black': '#1A1210',
    'White': '#FAFAF8',
    'Navy': '#1B2A4A',
    'Cream': '#FDF6EE',
    'Sage': '#8B9E84',
    'Terracotta': '#C4795A',
    'Charcoal': '#2C2420',
    'Dusty Rose': '#D4A5A5',
    'Camel': '#C19A6B',
    'Olive': '#6B7C3F',
    'Burgundy': '#722F37',
    'Stone': '#B8B0A2',
    'Forest Green': '#2C5F2D',
    'Mauve': '#B57B9E',
    'Indigo': '#3F51B5',
  }
  return map[name] || '#D4C5B5'
}
