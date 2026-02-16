'use client'

import { useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getProductByHandle, getRelatedProducts, getProductReviews } from '@/lib/data'
import { formatPrice, getDiscountPercentage } from '@/lib/utils'
import { useCartStore } from '@/stores/cart-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useUIStore } from '@/stores/ui-store'
import { getColorHex } from '@/lib/colors'
import { useMagneticHover } from '@/hooks/useMagneticHover'
import Badge from '@/components/ui/Badge'
import Rating from '@/components/ui/Rating'
import ReviewStars from '@/components/ui/ReviewStars'
import ProductCard from '@/components/product/ProductCard'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'

gsap.registerPlugin(ScrollTrigger)

/* ═════════════════════════════════════════════════════
   MAIN PRODUCT PAGE COMPONENT
   ═════════════════════════════════════════════════════ */
export default function ProductPage() {
  const params = useParams()
  const slug = params.slug as string
  const product = getProductByHandle(slug)

  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [imageZoomed, setImageZoomed] = useState(false)

  const mainImageRef = useRef<HTMLDivElement>(null)
  const mainImageInnerRef = useRef<HTMLDivElement>(null)
  const addBagBtn = useMagneticHover(0.25)

  const addToCart = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const toggleWishlist = useWishlistStore((s) => s.toggleItem)
  const hasWishlist = useWishlistStore((s) => s.hasItem)
  const addToast = useUIStore((s) => s.addToast)

  /* GSAP zoom on hover for the main image */
  const handleImageMouseEnter = useCallback(() => {
    if (!mainImageInnerRef.current) return
    setImageZoomed(true)
    gsap.to(mainImageInnerRef.current, {
      scale: 1.08,
      duration: 0.8,
      ease: 'power2.out',
    })
  }, [])

  const handleImageMouseLeave = useCallback(() => {
    if (!mainImageInnerRef.current) return
    setImageZoomed(false)
    gsap.to(mainImageInnerRef.current, {
      scale: 1,
      duration: 0.6,
      ease: 'power2.inOut',
    })
  }, [])

  const handleImageMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!mainImageInnerRef.current || !mainImageRef.current) return
      const rect = mainImageRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * -12
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12
      gsap.to(mainImageInnerRef.current, {
        x,
        y,
        duration: 0.4,
        ease: 'power2.out',
      })
    },
    []
  )

  /* ─── Not Found ─── */
  if (!product) {
    return (
      <div className="pt-32 pb-20 text-center bg-ivory min-h-screen">
        <h1 className="font-heading text-4xl text-burgundy mb-4">Product Not Found</h1>
        <p className="text-wine mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/shop"
          className="inline-block px-8 py-3 bg-burgundy text-gold-pale text-sm font-medium rounded-full hover:bg-burgundy-deep transition-colors duration-300"
        >
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
      (v) =>
        (v.color === selectedColor || !v.color) &&
        (v.size === (selectedSize || product.sizes[0]))
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
    <div className="pt-24 pb-20 bg-ivory min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Breadcrumb ─── */}
        <nav className="mb-8 text-sm text-rosewood/70">
          <Link href="/" className="hover:text-burgundy transition-colors duration-200">Home</Link>
          <span className="mx-2 text-dust">/</span>
          <Link href="/shop" className="hover:text-burgundy transition-colors duration-200">Shop</Link>
          <span className="mx-2 text-dust">/</span>
          <Link
            href={`/shop/${product.category}`}
            className="hover:text-burgundy transition-colors duration-200 capitalize"
          >
            {product.category}
          </Link>
          <span className="mx-2 text-dust">/</span>
          <span className="text-burgundy font-medium">{product.title}</span>
        </nav>

        {/* ─── Product Grid (Left: Gallery | Right: Info) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

          {/* ═══ LEFT: Gallery ═══ */}
          <FadeIn className="flex gap-3 flex-col-reverse sm:flex-row">
            {/* Thumbnail strip */}
            {product.images.length > 1 && (
              <div className="flex sm:flex-col gap-2 sm:w-20 shrink-0 order-2 sm:order-1">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(i)}
                    className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-md overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === i
                        ? 'border-gold shadow-[0_0_12px_rgba(241,225,148,0.3)]'
                        : 'border-silk/50 hover:border-gold-muted'
                    }`}
                  >
                    <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="80px" />
                    {selectedImage === i && (
                      <div className="absolute inset-0 bg-gold/10" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main image with GSAP zoom on hover */}
            <div className="flex-1 order-1 sm:order-2">
              <div
                ref={mainImageRef}
                className="relative aspect-[3/4] bg-parchment rounded-lg overflow-hidden cursor-crosshair"
                onMouseEnter={handleImageMouseEnter}
                onMouseLeave={handleImageMouseLeave}
                onMouseMove={handleImageMouseMove}
              >
                <div ref={mainImageInnerRef} className="w-full h-full will-change-transform">
                  <Image
                    src={product.images[selectedImage]?.src || '/images/placeholder.jpg'}
                    alt={product.images[selectedImage]?.alt || product.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>

                {/* Sale badge */}
                {product.compareAtPrice && (
                  <Badge variant="sale" className="absolute top-4 left-4 z-10">
                    -{getDiscountPercentage(product.price, product.compareAtPrice)}%
                  </Badge>
                )}

                {/* Zoom indicator */}
                <div
                  className={`absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wider uppercase transition-opacity duration-300 text-gold-pale ${
                    imageZoomed ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                  style={{ background: 'rgba(91,14,20,0.75)', backdropFilter: 'blur(8px)' }}
                >
                  Zoom Active
                </div>

                {/* Gold corner accents */}
                <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: 'linear-gradient(to right, #F1E194, transparent)' }} />
                  <div className="absolute top-0 left-0 h-full w-[1px]" style={{ background: 'linear-gradient(to bottom, #F1E194, transparent)' }} />
                </div>
                <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none">
                  <div className="absolute bottom-0 right-0 w-full h-[1px]" style={{ background: 'linear-gradient(to left, #F1E194, transparent)' }} />
                  <div className="absolute bottom-0 right-0 h-full w-[1px]" style={{ background: 'linear-gradient(to top, #F1E194, transparent)' }} />
                </div>
              </div>
            </div>
          </FadeIn>

          {/* ═══ RIGHT: Product Info ═══ */}
          <FadeIn delay={0.12} className="lg:py-4">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              {product.new && <Badge variant="new">New</Badge>}
              {product.bestseller && <Badge variant="bestseller">Bestseller</Badge>}
            </div>

            {/* Vendor */}
            <p className="text-xs font-semibold text-rosewood uppercase tracking-[0.25em] mb-2">
              {product.vendor}
            </p>

            {/* Title - display-sm in burgundy */}
            <h1
              className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.1] mb-3 text-burgundy"
            >
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <Rating value={product.rating} showValue count={product.reviewCount} />
            </div>

            {/* Price - mono in gold */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className="font-mono text-2xl font-semibold text-gold-muted"
              >
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="font-mono text-lg text-dust line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              {product.compareAtPrice && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gold/20 text-wine"
                >
                  Save {getDiscountPercentage(product.price, product.compareAtPrice)}%
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-wine/80 leading-relaxed mb-8 text-[0.95rem]">
              {product.description}
            </p>

            {/* Decorative divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-[1px]" style={{ background: 'linear-gradient(to right, transparent, #D4C47D, transparent)' }} />
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-gold-muted">
                <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7-6.3-4.6-6.3 4.6 2.3-7-6-4.6h7.6z" />
              </svg>
              <div className="flex-1 h-[1px]" style={{ background: 'linear-gradient(to right, transparent, #D4C47D, transparent)' }} />
            </div>

            {/* ─── Color Picker with gold ring selected state ─── */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-medium text-burgundy mb-3">
                  Color:{' '}
                  <span className="font-normal text-wine/70">{selectedColor}</span>
                </p>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-9 h-9 rounded-full transition-all duration-300 ${
                        selectedColor === color ? 'scale-110' : 'hover:scale-105'
                      }`}
                      title={color}
                      aria-label={`Select ${color}`}
                      aria-pressed={selectedColor === color}
                    >
                      {/* Gold ring for selected state */}
                      {selectedColor === color && (
                        <span
                          className="absolute -inset-[3px] rounded-full border-2 animate-pulse border-gold shadow-[0_0_10px_rgba(241,225,148,0.35)]"
                        />
                      )}
                      <span
                        className={`block w-full h-full rounded-full border ${
                          selectedColor === color ? 'border-gold' : 'border-silk'
                        }`}
                        style={{ backgroundColor: getColorHex(color) }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Size Picker with burgundy border ─── */}
            {product.sizes[0] !== 'One Size' && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-burgundy">Size</p>
                  <button className="text-xs text-wine underline decoration-gold-muted/50 underline-offset-2 hover:text-burgundy transition-colors duration-200">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[48px] h-12 px-5 rounded-full text-sm font-medium transition-all duration-300 border-2 ${
                        selectedSize === size
                          ? 'text-gold-pale bg-burgundy border-burgundy shadow-[0_0_12px_rgba(91,14,20,0.2)]'
                          : 'border-silk text-burgundy hover:border-burgundy/60'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Quantity + Add to Bag + Wishlist ─── */}
            <div className="flex gap-3 mb-6">
              {/* Quantity selector */}
              <div
                className="flex items-center rounded-full border-2 border-silk overflow-hidden"
              >
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-12 flex items-center justify-center text-wine hover:text-burgundy hover:bg-parchment transition-colors duration-200"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <span className="w-10 text-center text-sm font-mono font-semibold text-burgundy">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-11 h-12 flex items-center justify-center text-wine hover:text-burgundy hover:bg-parchment transition-colors duration-200"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>

              {/* Add to Bag - burgundy bg, gold-pale text, magnetic hover */}
              <button
                ref={addBagBtn.ref}
                onMouseMove={addBagBtn.onMouseMove}
                onMouseLeave={addBagBtn.onMouseLeave}
                onClick={handleAddToCart}
                className="flex-1 py-3 rounded-full text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:shadow-[0_8px_30px_rgba(91,14,20,0.3)] active:scale-95 bg-burgundy text-gold-pale"
              >
                Add to Bag
              </button>

              {/* Wishlist heart */}
              <button
                onClick={() => {
                  toggleWishlist(product.handle)
                  addToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist')
                }}
                className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isWishlisted
                    ? 'border-gold bg-gold/10 text-wine'
                    : 'border-silk text-wine/60 hover:border-burgundy/40 hover:text-burgundy'
                }`}
                aria-label="Toggle wishlist"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill={isWishlisted ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
            </div>

            {/* ─── Trust signals ─── */}
            <div className="flex items-center gap-6 mb-8 py-4 px-5 rounded-xl bg-parchment/60">
              <div className="flex items-center gap-2 text-xs text-wine">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-muted">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-wine">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-muted">
                  <rect x="1" y="3" width="15" height="13" rx="2" />
                  <path d="M16 8h4l3 3v5a2 2 0 01-2 2h-1" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>Free Shipping 100+</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-wine">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-muted">
                  <path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z" />
                  <path d="M14 9l-5 5M9 9l5 5" />
                </svg>
                <span>30-Day Returns</span>
              </div>
            </div>

            {/* ─── Product Details Accordion ─── */}
            <div className="border-t border-silk pt-6 space-y-0">
              <details className="group" open>
                <summary className="flex items-center justify-between cursor-pointer py-3 hover:bg-parchment/40 -mx-2 px-2 rounded-lg transition-colors duration-200">
                  <span className="text-sm font-semibold text-burgundy tracking-wide">Product Details</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="transition-transform duration-300 group-open:rotate-180 text-burgundy"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="pb-4 text-sm text-wine/80 leading-relaxed">
                  <ul className="space-y-2 mt-2 ml-1">
                    <li className="flex gap-2">
                      <span className="text-gold-muted">&#8226;</span>
                      Category: <span className="capitalize text-burgundy">{product.category}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gold-muted">&#8226;</span>
                      Product Type: <span className="text-burgundy">{product.productType}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gold-muted">&#8226;</span>
                      Vendor: <span className="text-burgundy">{product.vendor}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-gold-muted">&#8226;</span>
                      Tags: <span className="text-burgundy">{product.tags.join(', ')}</span>
                    </li>
                  </ul>
                </div>
              </details>

              <details className="group border-t border-silk">
                <summary className="flex items-center justify-between cursor-pointer py-3 hover:bg-parchment/40 -mx-2 px-2 rounded-lg transition-colors duration-200">
                  <span className="text-sm font-semibold text-burgundy tracking-wide">Shipping & Returns</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="transition-transform duration-300 group-open:rotate-180 text-burgundy"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="pb-4 text-sm text-wine/80 leading-relaxed mt-2 ml-1">
                  <p>Free standard shipping on orders over $100. Express shipping available at checkout.</p>
                  <p className="mt-2">Returns accepted within 30 days of purchase. Items must be unworn with tags attached.</p>
                </div>
              </details>

              <details className="group border-t border-silk">
                <summary className="flex items-center justify-between cursor-pointer py-3 hover:bg-parchment/40 -mx-2 px-2 rounded-lg transition-colors duration-200">
                  <span className="text-sm font-semibold text-burgundy tracking-wide">Care Instructions</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="transition-transform duration-300 group-open:rotate-180 text-burgundy"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <div className="pb-4 text-sm text-wine/80 leading-relaxed mt-2 ml-1">
                  <p>Gentle hand wash or dry clean recommended. Store in a cool, dry place away from direct sunlight.</p>
                </div>
              </details>
            </div>
          </FadeIn>
        </div>

        {/* ═══════════════════════════════════════════════
            REVIEWS SECTION - Glass-morphism cards with gold stars
            ═══════════════════════════════════════════════ */}
        {reviews.length > 0 && (
          <section className="mt-24 pt-16 border-t border-silk">
            {/* Section header */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-1 h-[1px]" style={{ background: 'linear-gradient(to right, #D4C47D, transparent)' }} />
              <TextReveal as="h2" className="text-3xl sm:text-4xl text-burgundy text-center">
                Customer Reviews
              </TextReveal>
              <div className="flex-1 h-[1px]" style={{ background: 'linear-gradient(to left, #D4C47D, transparent)' }} />
            </div>

            {/* Review summary bar */}
            <div
              className="flex items-center justify-center gap-6 mb-10 py-4 px-6 rounded-xl mx-auto max-w-xl"
              style={{
                background: 'rgba(245,237,216,0.5)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(212,196,125,0.3)',
              }}
            >
              <div className="text-center">
                <span className="block font-heading text-3xl text-burgundy">{product.rating.toFixed(1)}</span>
                <ReviewStars value={product.rating} />
              </div>
              <div className="w-[1px] h-10 bg-gold-muted/40" />
              <div className="text-center">
                <span className="block font-heading text-2xl text-burgundy">{product.reviewCount}</span>
                <span className="text-xs text-wine/60 uppercase tracking-wider">Reviews</span>
              </div>
            </div>

            {/* Review cards - glass-morphism */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map((review, index) => (
                <FadeIn key={review.id} delay={index * 0.08}>
                  <div
                    className="relative p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group"
                    style={{
                      background: 'rgba(253,248,236,0.65)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: '1px solid rgba(212,196,125,0.25)',
                    }}
                  >
                    {/* Gold accent on hover */}
                    <div
                      className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: 'linear-gradient(135deg, rgba(241,225,148,0.08) 0%, transparent 50%)',
                      }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-3">
                        <ReviewStars value={review.rating} />
                        {review.verified && (
                          <span
                            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full text-burgundy bg-gold/30"
                          >
                            Verified
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-burgundy mb-2">{review.title}</h4>
                      <p className="text-sm text-wine/70 leading-relaxed mb-3">{review.body}</p>
                      <p className="text-xs text-rosewood/50">
                        {review.author}{' '}
                        <span className="text-gold-muted">&mdash;</span>{' '}
                        {review.date}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════
            RELATED PRODUCTS - 4-col grid with stagger entrance
            ═══════════════════════════════════════════════ */}
        {related.length > 0 && (
          <section className="mt-24 pt-16 border-t border-silk">
            {/* Section header */}
            <div className="flex items-center gap-4 mb-10">
              <div className="flex-1 h-[1px]" style={{ background: 'linear-gradient(to right, #D4C47D, transparent)' }} />
              <TextReveal as="h2" className="text-3xl sm:text-4xl text-burgundy text-center">
                You May Also Like
              </TextReveal>
              <div className="flex-1 h-[1px]" style={{ background: 'linear-gradient(to left, #D4C47D, transparent)' }} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {related.map((p, i) => (
                <FadeIn key={p.id} delay={i * 0.08}>
                  <ProductCard product={p} index={i} />
                </FadeIn>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
