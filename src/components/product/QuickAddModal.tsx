'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { getColorHex } from '@/lib/colors'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

interface QuickAddModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

export default function QuickAddModal({ product, isOpen, onClose }: QuickAddModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0] || '')
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || '')
  const [quantity, setQuantity] = useState(1)

  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const addToast = useUIStore((s) => s.addToast)

  const backdropRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const swatchesRef = useRef<HTMLDivElement>(null)

  // Reset state when product changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedColor(product.colors[0] || '')
      setSelectedSize(product.sizes[0] || '')
      setQuantity(1)
    }
  }, [isOpen, product])

  // Entrance / exit animations
  useEffect(() => {
    if (!panelRef.current || !backdropRef.current) return

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      useUIStore.getState().lenisStop?.()
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      )
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'expo.out', delay: 0.05 }
      )

      // Staggered swatch pop-in
      if (swatchesRef.current) {
        const swatches = swatchesRef.current.querySelectorAll('.color-swatch')
        gsap.fromTo(
          swatches,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.35, stagger: 0.05, ease: 'back.out(1.7)', delay: 0.2 }
        )
      }
    } else {
      document.body.style.overflow = ''
      useUIStore.getState().lenisStart?.()
    }

    return () => {
      document.body.style.overflow = ''
      useUIStore.getState().lenisStart?.()
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // 3D perspective tilt on mouse move over the image
  const handleImageMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    const rotateY = x * 10
    const rotateX = -y * 10
    imageRef.current.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
  }, [])

  const handleImageMouseLeave = useCallback(() => {
    if (!imageRef.current) return
    imageRef.current.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)'
  }, [])

  const handleAddToBag = () => {
    const variant = product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    ) || product.variants[0]

    if (!variant) return

    addItem({
      productId: product.id,
      variantId: variant.id,
      handle: product.handle,
      title: product.title,
      image: product.images[0]?.src || '/images/placeholder.jpg',
      price: variant.price || product.price,
      size: selectedSize,
      color: selectedColor,
      quantity,
    })

    addToast(`${product.title} added to bag`)
    onClose()
    openCart()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="absolute inset-0 bg-noir/60 backdrop-blur-sm"
        style={{ opacity: 0 }}
      />

      {/* Modal Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Quick add ${product.title}`}
        className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-ivory rounded-sm shadow-2xl"
        style={{ opacity: 0 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-parchment/80 text-burgundy hover:bg-gold-pale transition-colors"
          aria-label="Close quick add modal"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Image */}
          <div className="relative aspect-[3/4] bg-parchment overflow-hidden">
            <div
              ref={imageRef}
              onMouseMove={handleImageMouseMove}
              onMouseLeave={handleImageMouseLeave}
              className="w-full h-full transition-transform duration-200 ease-out"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Image
                src={product.images[0]?.src || '/images/placeholder.jpg'}
                alt={product.images[0]?.alt || product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="p-6 md:p-8 flex flex-col">
            {/* Category */}
            <p className="text-[10px] text-dust uppercase tracking-[0.2em] font-medium mb-1">
              {product.category}
            </p>

            {/* Title */}
            <h2 className="font-heading text-2xl text-burgundy mb-2">
              {product.title}
            </h2>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-mono text-lg font-medium text-wine">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="font-mono text-sm text-dust line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Color Selector */}
            {product.colors.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-medium text-burgundy uppercase tracking-wider mb-2.5">
                  Color: <span className="text-wine font-normal normal-case">{selectedColor}</span>
                </p>
                <div ref={swatchesRef} className="flex flex-wrap gap-2.5">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`color-swatch w-8 h-8 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        selectedColor === color
                          ? 'border-burgundy ring-2 ring-burgundy/20 ring-offset-2 ring-offset-ivory'
                          : 'border-silk hover:border-gold'
                      }`}
                      style={{ backgroundColor: getColorHex(color), opacity: 0 }}
                      aria-label={`Select color ${color}`}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {product.sizes.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-medium text-burgundy uppercase tracking-wider mb-2.5">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-full border transition-all duration-200 ${
                        selectedSize === size
                          ? 'bg-burgundy text-gold-pale border-burgundy'
                          : 'bg-transparent text-burgundy border-silk hover:border-gold'
                      }`}
                      aria-label={`Select size ${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <p className="text-xs font-medium text-burgundy uppercase tracking-wider mb-2.5">
                Quantity
              </p>
              <div className="inline-flex items-center border border-silk rounded-full">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-burgundy hover:bg-parchment transition-colors rounded-l-full"
                  aria-label="Decrease quantity"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                  </svg>
                </button>
                <span className="w-10 text-center text-sm font-medium text-burgundy tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-burgundy hover:bg-parchment transition-colors rounded-r-full"
                  aria-label="Increase quantity"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add to Bag Button */}
            <button
              onClick={handleAddToBag}
              className="group relative w-full py-3.5 text-sm font-semibold uppercase tracking-wider border-2 border-burgundy text-burgundy overflow-hidden rounded-none transition-colors duration-500 hover:text-burgundy-deep mt-auto"
            >
              <span className="absolute inset-0 bg-gold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[var(--ease-yarn-pull)]" />
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                Add to Bag — {formatPrice(product.price * quantity)}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
