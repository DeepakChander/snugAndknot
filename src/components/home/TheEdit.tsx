'use client'

import HorizontalScroll from '@/components/animation/HorizontalScroll'
import ProductCard from '@/components/product/ProductCard'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import { getFeaturedProducts } from '@/lib/data'
import { smartSlice } from '@/lib/smart-grid'

export default function TheEdit() {
  const allFeatured = getFeaturedProducts()
  const featured = smartSlice(allFeatured, 4)

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-terracotta uppercase tracking-[0.3em] mb-2">Curated Selection</p>
            <TextReveal as="h2" className="text-4xl sm:text-5xl lg:text-6xl text-charcoal">
              The Edit
            </TextReveal>
          </div>
          <FadeIn delay={0.3}>
            <p className="text-walnut max-w-sm">
              Our editors&apos; hand-picked favorites for the season. Pieces that define the Snug&Knot ethos.
            </p>
          </FadeIn>
        </div>
      </div>

      <HorizontalScroll>
        <div className="flex gap-5 px-4 sm:px-6 lg:px-8">
          {/* Leading spacer */}
          <div className="shrink-0 w-8 lg:w-16" />
          {featured.map((product, i) => (
            <div key={product.id} className="shrink-0 w-[260px] sm:w-[300px]">
              <ProductCard product={product} index={i} />
            </div>
          ))}
          {/* Trailing spacer */}
          <div className="shrink-0 w-8 lg:w-16" />
        </div>
      </HorizontalScroll>
    </section>
  )
}
