'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRecentlyViewedStore } from '@/stores/recently-viewed-store'
import { getProductByHandle } from '@/lib/data'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/types'

export default function RecentlyViewed() {
  const handles = useRecentlyViewedStore((s) => s.handles)

  const products = useMemo(() => {
    return handles
      .map((handle) => getProductByHandle(handle))
      .filter((p): p is Product => p !== undefined)
      .slice(0, 4)
  }, [handles])

  if (products.length === 0) return null

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <h2 className="font-heading text-xl md:text-2xl text-burgundy mb-6">
          Recently Viewed
        </h2>

        {/* Horizontal Scroll Strip */}
        <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div
            className="flex gap-4 md:gap-5"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {products.map((product) => (
              <Link
                key={product.handle}
                href={`/product/${product.handle}`}
                className="group shrink-0 w-[160px] md:w-[190px]"
                style={{ scrollSnapAlign: 'start' }}
              >
                {/* Mini Image */}
                <div className="relative aspect-[3/4] bg-parchment overflow-hidden mb-2">
                  <Image
                    src={product.images[0]?.src || '/images/placeholder.jpg'}
                    alt={product.images[0]?.alt || product.title}
                    fill
                    sizes="190px"
                    className="object-cover transition-transform duration-500 ease-[var(--ease-loom-settle)] group-hover:scale-105"
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-burgundy-deep/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Info */}
                <h3 className="text-xs font-medium text-burgundy group-hover:text-wine transition-colors duration-300 line-clamp-1">
                  {product.title}
                </h3>
                <p className="font-mono text-xs text-wine mt-0.5">
                  {formatPrice(product.price)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
