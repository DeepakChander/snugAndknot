'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { searchProducts } from '@/lib/data'
import { debounce } from '@/lib/utils'
import ProductCard from '@/components/product/ProductCard'
import TextReveal from '@/components/animation/TextReveal'
import type { Product } from '@/types'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const debouncedSearch = useCallback(
    debounce((q: string) => {
      if (q.length >= 2) {
        setResults(searchProducts(q))
        setHasSearched(true)
      } else {
        setResults([])
        setHasSearched(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <TextReveal as="h1" className="text-5xl sm:text-6xl lg:text-7xl text-charcoal mb-6">
            Search
          </TextReveal>
          <div className="max-w-xl">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-earth"
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, categories..."
                autoFocus
                className="w-full pl-12 pr-4 py-4 bg-cream-dark border border-beige rounded-full text-charcoal placeholder:text-sand focus:outline-none focus:border-charcoal transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {hasSearched && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-earth mb-6">
              {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </p>
            {results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {results.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} priority={i < 4} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-walnut text-lg mb-2">No products found</p>
                <p className="text-earth">Try searching for something else</p>
              </div>
            )}
          </motion.div>
        )}

        {!hasSearched && (
          <div className="text-center py-16 text-earth">
            <p>Start typing to search our collection</p>
          </div>
        )}
      </div>
    </div>
  )
}
