'use client'

import Link from 'next/link'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import ProductGrid from '@/components/product/ProductGrid'
import { getNewArrivals } from '@/lib/data'
import { smartSlice } from '@/lib/smart-grid'

export default function NewArrivals() {
  const allArrivals = getNewArrivals()
  const arrivals = smartSlice(allArrivals, 4)

  return (
    <section className="py-24 lg:py-36 bg-cream-dark">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-14">
          <div>
            <p className="font-mono text-xs text-terracotta tracking-[0.3em] uppercase mb-3">Just Arrived</p>
            <TextReveal as="h2" className="text-4xl sm:text-5xl lg:text-7xl text-charcoal">
              New Arrivals
            </TextReveal>
          </div>
          <FadeIn delay={0.3}>
            <Link
              href="/shop?sort=newest"
              className="group inline-flex items-center gap-2 text-sm font-medium text-charcoal border-b border-charcoal/30 pb-1 hover:border-charcoal transition-colors"
            >
              View All
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </FadeIn>
        </div>

        <ProductGrid products={arrivals} columns={4} />
      </div>
    </section>
  )
}
