'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import ProductCard from '@/components/product/ProductCard'
import { filterProducts, getCategoryBySlug } from '@/lib/data'
import type { CategorySlug, SortOption } from '@/types'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'rating', label: 'Top Rated' },
]

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params.category as CategorySlug
  const category = getCategoryBySlug(categorySlug)
  const [sort, setSort] = useState<SortOption>('featured')

  const products = useMemo(
    () => filterProducts({ category: categorySlug, sort }),
    [categorySlug, sort]
  )

  if (!category) {
    return (
      <div className="pt-32 pb-20 text-center">
        <h1 className="font-heading text-4xl text-charcoal mb-4">Category Not Found</h1>
        <p className="text-walnut">The category you&apos;re looking for doesn&apos;t exist.</p>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold text-terracotta uppercase tracking-[0.3em] mb-2">Shop</p>
          <TextReveal as="h1" className="text-5xl sm:text-6xl lg:text-7xl text-charcoal mb-3">
            {category.title}
          </TextReveal>
          <FadeIn delay={0.2}>
            <p className="text-walnut text-lg max-w-xl">{category.description}</p>
          </FadeIn>
        </div>

        {/* Sort bar */}
        <div className="flex items-center justify-between py-4 mb-8 border-b border-beige">
          <p className="text-sm text-earth">{products.length} products</p>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-4 py-2 border border-beige rounded-full text-sm text-charcoal bg-transparent focus:outline-none focus:border-charcoal transition-colors cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product, i) => (
            <div key={product.id}>
              <ProductCard product={product} index={i} priority={i < 8} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
