'use client'

import { useState, useEffect, useCallback } from 'react'
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
    <div className="min-h-screen bg-ivory pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <TextReveal as="h1" className="text-5xl sm:text-6xl lg:text-7xl text-burgundy mb-6">
            Search
          </TextReveal>
          <div className="max-w-xl">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-rosewood"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
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
                className="w-full pl-12 pr-4 py-4 bg-parchment border border-burgundy rounded-full text-wine placeholder:text-dust focus:outline-none focus:ring-2 focus:ring-gold focus:border-burgundy-light transition-all"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {hasSearched && (
          <div>
            <p className="text-sm text-rosewood mb-6">
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
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="mx-auto mb-4 text-gold"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                  <path d="M8 11h6" />
                </svg>
                <p className="text-wine text-lg mb-2">No products found</p>
                <p className="text-rosewood">Try searching for something else</p>
              </div>
            )}
          </div>
        )}

        {!hasSearched && (
          <div className="text-center py-16">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="mx-auto mb-3 text-gold-muted"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <p className="text-wine">Start typing to search our collection</p>
          </div>
        )}
      </div>
    </div>
  )
}
