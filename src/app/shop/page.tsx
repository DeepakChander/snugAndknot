'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import ProductCard from '@/components/product/ProductCard'
import { filterProducts, getAllColors, getAllSizes, getPriceRange } from '@/lib/data'
import type { CategorySlug, SortOption } from '@/types'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'best-selling', label: 'Best Selling' },
  { value: 'rating', label: 'Top Rated' },
]

export default function ShopPage() {
  const [sort, setSort] = useState<SortOption>('featured')
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const allColors = getAllColors()
  const allSizes = getAllSizes()
  const [minPrice, maxPrice] = getPriceRange()

  const products = useMemo(
    () => filterProducts({ colors: selectedColors, sizes: selectedSizes, sort }),
    [selectedColors, selectedSizes, sort]
  )

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
  }

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  const clearFilters = () => {
    setSelectedColors([])
    setSelectedSizes([])
    setSort('featured')
  }

  const hasActiveFilters = selectedColors.length > 0 || selectedSizes.length > 0

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <TextReveal as="h1" className="text-5xl sm:text-6xl lg:text-7xl text-charcoal mb-3">
            Shop All
          </TextReveal>
          <FadeIn delay={0.2}>
            <p className="text-walnut text-lg">{products.length} products</p>
          </FadeIn>
        </div>

        {/* Filter bar */}
        <div className="sticky top-16 lg:top-20 z-30 bg-cream/95 backdrop-blur-md py-4 mb-8 border-b border-beige -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-beige rounded-full text-sm text-charcoal hover:border-charcoal transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="16" y2="12" />
                  <line x1="4" y1="18" x2="12" y2="18" />
                </svg>
                Filters
                {hasActiveFilters && (
                  <span className="w-5 h-5 bg-terracotta text-cream text-[10px] rounded-full flex items-center justify-center">
                    {selectedColors.length + selectedSizes.length}
                  </span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-earth hover:text-charcoal transition-colors underline"
                >
                  Clear all
                </button>
              )}
            </div>

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

          {/* Expanded filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-6 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Colors */}
                  <div>
                    <h3 className="text-xs font-semibold text-earth uppercase tracking-widest mb-3">Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {allColors.map((color) => (
                        <button
                          key={color}
                          onClick={() => toggleColor(color)}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                            selectedColors.includes(color)
                              ? 'bg-charcoal text-cream border-charcoal'
                              : 'border-beige text-walnut hover:border-charcoal'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <h3 className="text-xs font-semibold text-earth uppercase tracking-widest mb-3">Size</h3>
                    <div className="flex flex-wrap gap-2">
                      {allSizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`w-10 h-10 text-xs rounded-full border transition-colors flex items-center justify-center ${
                            selectedSizes.includes(size)
                              ? 'bg-charcoal text-cream border-charcoal'
                              : 'border-beige text-walnut hover:border-charcoal'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price info */}
                  <div>
                    <h3 className="text-xs font-semibold text-earth uppercase tracking-widest mb-3">Price Range</h3>
                    <p className="text-sm text-walnut">
                      ${minPrice.toFixed(0)} &mdash; ${maxPrice.toFixed(0)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product grid */}
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard product={product} index={i} priority={i < 8} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {products.length === 0 && (
          <div className="text-center py-20">
            <p className="text-walnut text-lg mb-2">No products found</p>
            <p className="text-earth mb-6">Try adjusting your filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-charcoal text-cream text-sm font-medium rounded-full hover:bg-espresso transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
