'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getProductByHandle, getRelatedProducts, getProductReviews } from '@/lib/data'
import { formatPrice, getDiscountPercentage } from '@/lib/utils'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useUIStore } from '@/stores/ui-store'
import Badge from '@/components/ui/Badge'
import Rating from '@/components/ui/Rating'
import ProductCard from '@/components/product/ProductCard'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'

function getColorHex(name: string): string {
  const map: Record<string, string> = {
    'Black': '#1A1210', 'White': '#FAFAF8', 'Navy': '#1B2A4A', 'Cream': '#FDF6EE',
    'Sage': '#8B9E84', 'Terracotta': '#C4795A', 'Charcoal': '#2C2420', 'Dusty Rose': '#D4A5A5',
    'Camel': '#C19A6B', 'Olive': '#6B7C3F', 'Burgundy': '#722F37', 'Stone': '#B8B0A2',
    'Forest Green': '#2C5F2D', 'Mauve': '#B57B9E', 'Indigo': '#3F51B5',
  }
  return map[name] || '#D4C5B5'
}

export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const product = getProductByHandle(slug)
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const addToCart = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const toggleWishlist = useWishlistStore((s) => s.toggleItem)
  const hasWishlist = useWishlistStore((s) => s.hasItem)
  const addToast = useUIStore((s) => s.addToast)

  if (!product) {
    return (
      <div className="pt-32 pb-20 text-center">
        <h1 className="font-heading text-4xl text-charcoal mb-4">Product Not Found</h1>
        <p className="text-walnut mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/shop" className="px-6 py-2.5 bg-charcoal text-cream text-sm font-medium rounded-full hover:bg-espresso transition-colors">
          Back to Shop
        </Link>
      </div>
    )
  }

  const related = getRelatedProducts(slug, 4)
  const reviews = getProductReviews(product.id)
  const isWishlisted = hasWishlist(product.handle)

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes[0] !== 'One Size') {
      addToast('Please select a size', 'error')
      return
    }
    const variant = product.variants.find(
      (v) => (v.color === selectedColor || !v.color) && (v.size === (selectedSize || product.sizes[0]))
    ) || product.variants[0]

    addToCart({
      productId: product.id,
      variantId: variant.id,
      handle: product.handle,
      title: product.title,
      image: product.images[0]?.src || '/images/placeholder.jpg',
      price: variant.price,
      size: selectedSize || product.sizes[0],
      color: selectedColor,
      quantity,
    })
    addToast(`${product.title} added to bag`)
    openCart()
  }

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-earth">
          <Link href="/" className="hover:text-charcoal transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-charcoal transition-colors">Shop</Link>
          <span className="mx-2">/</span>
          <Link href={`/shop/${product.category}`} className="hover:text-charcoal transition-colors capitalize">{product.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-charcoal">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Main image */}
            <div className="relative aspect-[3/4] bg-cream-dark rounded-lg overflow-hidden mb-3">
              <Image
                src={product.images[selectedImage]?.src || '/images/placeholder.jpg'}
                alt={product.images[selectedImage]?.alt || product.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {product.compareAtPrice && (
                <Badge variant="sale" className="absolute top-4 left-4">
                  -{getDiscountPercentage(product.price, product.compareAtPrice)}%
                </Badge>
              )}
            </div>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-20 h-24 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-charcoal' : 'border-transparent'
                    }`}
                  >
                    <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:py-4"
          >
            <div className="flex items-center gap-2 mb-3">
              {product.new && <Badge variant="new">New</Badge>}
              {product.bestseller && <Badge variant="bestseller">Bestseller</Badge>}
            </div>

            <p className="text-xs font-semibold text-earth uppercase tracking-[0.2em] mb-2">{product.vendor}</p>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-charcoal mb-3">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4">
              <Rating value={product.rating} showValue count={product.reviewCount} />
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-2xl text-charcoal">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <span className="font-mono text-lg text-earth line-through">{formatPrice(product.compareAtPrice)}</span>
              )}
            </div>

            <p className="text-walnut leading-relaxed mb-8">{product.description}</p>

            {/* Color picker */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-charcoal mb-3">Color: <span className="font-normal text-walnut">{selectedColor}</span></p>
                <div className="flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color ? 'border-charcoal scale-110' : 'border-beige'
                      }`}
                      style={{ backgroundColor: getColorHex(color) }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size picker */}
            {product.sizes[0] !== 'One Size' && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-charcoal">Size</p>
                  <button className="text-xs text-earth underline hover:text-charcoal transition-colors">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[44px] h-11 px-4 rounded-full border text-sm font-medium transition-colors ${
                        selectedSize === size
                          ? 'bg-charcoal text-cream border-charcoal'
                          : 'border-beige text-charcoal hover:border-charcoal'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex gap-3 mb-6">
              <div className="flex items-center border border-beige rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-11 flex items-center justify-center text-walnut hover:text-charcoal transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm text-charcoal">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-11 flex items-center justify-center text-walnut hover:text-charcoal transition-colors"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 bg-charcoal text-cream text-sm font-medium rounded-full hover:bg-espresso transition-colors"
              >
                Add to Bag
              </button>
              <button
                onClick={() => {
                  toggleWishlist(product.handle)
                  addToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
                }}
                className={`w-11 h-11 flex items-center justify-center rounded-full border transition-colors ${
                  isWishlisted ? 'border-terracotta text-terracotta' : 'border-beige text-walnut hover:border-charcoal'
                }`}
                aria-label="Toggle wishlist"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
            </div>

            {/* Product details accordion */}
            <div className="border-t border-beige pt-6 space-y-4">
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer py-2">
                  <span className="text-sm font-medium text-charcoal">Product Details</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="transition-transform group-open:rotate-180">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="pb-4 text-sm text-walnut leading-relaxed">
                  <ul className="space-y-1 mt-2">
                    <li>Category: <span className="capitalize">{product.category}</span></li>
                    <li>Product Type: {product.productType}</li>
                    <li>Vendor: {product.vendor}</li>
                    <li>Tags: {product.tags.join(', ')}</li>
                  </ul>
                </div>
              </details>
              <details className="group border-t border-beige">
                <summary className="flex items-center justify-between cursor-pointer py-2">
                  <span className="text-sm font-medium text-charcoal">Shipping & Returns</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="transition-transform group-open:rotate-180">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="pb-4 text-sm text-walnut leading-relaxed mt-2">
                  <p>Free standard shipping on orders over $100. Express shipping available at checkout.</p>
                  <p className="mt-2">Returns accepted within 30 days of purchase. Items must be unworn with tags attached.</p>
                </div>
              </details>
            </div>
          </motion.div>
        </div>

        {/* Reviews section */}
        {reviews.length > 0 && (
          <section className="mt-20 pt-16 border-t border-beige">
            <TextReveal as="h2" className="text-3xl sm:text-4xl text-charcoal mb-8">
              Customer Reviews
            </TextReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <FadeIn key={review.id}>
                  <div className="p-6 bg-cream-dark rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Rating value={review.rating} />
                      {review.verified && (
                        <span className="text-[10px] text-sage font-semibold uppercase tracking-wider">Verified</span>
                      )}
                    </div>
                    <h4 className="text-sm font-medium text-charcoal mb-2">{review.title}</h4>
                    <p className="text-sm text-walnut leading-relaxed mb-3">{review.body}</p>
                    <p className="text-xs text-earth">{review.author} &mdash; {review.date}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </section>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <section className="mt-20 pt-16 border-t border-beige">
            <TextReveal as="h2" className="text-3xl sm:text-4xl text-charcoal mb-8">
              You May Also Like
            </TextReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
