'use client'

import { useMemo, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getRelatedProducts } from '@/lib/data'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { formatPrice } from '@/lib/utils'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import type { Product } from '@/types'

interface CompleteTheLookProps {
  currentHandle: string
}

export default function CompleteTheLook({ currentHandle }: CompleteTheLookProps) {
  const related = useMemo(() => getRelatedProducts(currentHandle, 3), [currentHandle])
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const addToast = useUIStore((s) => s.addToast)
  const svgRef = useRef<SVGSVGElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const totalPrice = useMemo(
    () => related.reduce((sum, p) => sum + p.price, 0),
    [related]
  )

  // Draw SVG connecting path between cards on desktop
  useEffect(() => {
    if (!svgRef.current || !gridRef.current) return

    const updatePath = () => {
      if (!svgRef.current || !gridRef.current) return
      const cards = gridRef.current.querySelectorAll<HTMLElement>('.look-card')
      if (cards.length < 2) return

      const gridRect = gridRef.current.getBoundingClientRect()
      let d = ''

      for (let i = 0; i < cards.length - 1; i++) {
        const cardA = cards[i].getBoundingClientRect()
        const cardB = cards[i + 1].getBoundingClientRect()

        const x1 = cardA.left + cardA.width - gridRect.left
        const y1 = cardA.top + cardA.height / 2 - gridRect.top
        const x2 = cardB.left - gridRect.left
        const y2 = cardB.top + cardB.height / 2 - gridRect.top

        const cx1 = x1 + (x2 - x1) * 0.4
        const cx2 = x1 + (x2 - x1) * 0.6

        if (i === 0) {
          d += `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`
        } else {
          d += ` C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`
        }
      }

      const path = svgRef.current.querySelector('path')
      if (path) path.setAttribute('d', d)
    }

    updatePath()
    window.addEventListener('resize', updatePath)
    return () => window.removeEventListener('resize', updatePath)
  }, [related])

  const handleAddAllToBag = () => {
    related.forEach((product: Product) => {
      const variant = product.variants[0]
      if (!variant) return
      addItem({
        productId: product.id,
        variantId: variant.id,
        handle: product.handle,
        title: product.title,
        image: product.images[0]?.src || '/images/placeholder.jpg',
        price: variant.price || product.price,
        size: variant.size || product.sizes[0] || 'One Size',
        color: variant.color || product.colors[0] || '',
        quantity: 1,
      })
    })
    addToast(`${related.length} items added to bag`)
    openCart()
  }

  if (related.length === 0) return null

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <TextReveal
            as="h2"
            className="font-heading text-3xl md:text-4xl text-burgundy"
          >
            Complete the Look
          </TextReveal>
        </div>

        {/* Product Grid with SVG Connectors */}
        <div ref={gridRef} className="relative">
          {/* SVG connecting path (desktop only) */}
          <svg
            ref={svgRef}
            className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block"
            style={{ zIndex: 0 }}
          >
            <path
              d=""
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.5"
            />
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
            {related.map((product, index) => (
              <FadeIn key={product.handle} delay={index * 0.15} variant="fade-up">
                <Link
                  href={`/product/${product.handle}`}
                  className="look-card group block"
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-parchment overflow-hidden mb-3">
                    <Image
                      src={product.images[0]?.src || '/images/placeholder.jpg'}
                      alt={product.images[0]?.alt || product.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-[var(--ease-loom-settle)] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-burgundy-deep/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Info */}
                  <h3 className="text-sm font-medium text-burgundy group-hover:text-wine transition-colors duration-300 line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="font-mono text-sm text-wine mt-0.5">
                    {formatPrice(product.price)}
                  </p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>

        {/* Add All to Bag */}
        <FadeIn delay={0.5} variant="fade-up">
          <div className="mt-10 text-center">
            <button
              onClick={handleAddAllToBag}
              className="group relative inline-flex items-center gap-3 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider border-2 border-burgundy text-burgundy overflow-hidden transition-colors duration-500 hover:text-burgundy-deep"
            >
              <span className="absolute inset-0 bg-gold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-[var(--ease-yarn-pull)]" />
              <span className="relative z-10 flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                Add All to Bag — {formatPrice(totalPrice)}
              </span>
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
