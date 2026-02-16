'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useUIStore } from '@/stores/ui-store'
import { searchProducts } from '@/lib/data'
import { formatPrice, debounce } from '@/lib/utils'
import type { Product } from '@/types'

export default function SearchOverlay() {
  const { isSearchOpen, closeSearch } = useUIStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])

  const debouncedSearch = useCallback(
    debounce((q: string) => {
      if (q.length >= 2) {
        setResults(searchProducts(q).slice(0, 8))
      } else {
        setResults([])
      }
    }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('')
      setResults([])
    }
  }, [isSearchOpen])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [closeSearch])

  return (
    <div
      className={`fixed inset-0 z-50 bg-cream/98 backdrop-blur-sm transition-opacity duration-300 ${
        isSearchOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
    >
          <div className="max-w-2xl mx-auto px-6 pt-24">
            {/* Close button */}
            <button
              onClick={closeSearch}
              className="absolute top-6 right-6 p-2 text-walnut hover:text-charcoal transition-colors"
              aria-label="Close search"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Search input */}
            <div
              className={`transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isSearchOpen
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-5'
              }`}
              style={{ transitionDelay: isSearchOpen ? '100ms' : '0ms' }}
            >
              <div className="relative">
                <svg
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-earth"
                  width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products..."
                  autoFocus
                  className="w-full pl-10 pr-4 py-4 bg-transparent border-b-2 border-beige focus:border-charcoal text-2xl font-heading text-charcoal placeholder:text-sand outline-none transition-colors"
                />
              </div>
            </div>

            {/* Results */}
            <div className="mt-8">
              {query.length >= 2 && results.length === 0 && (
                <p className="text-center text-earth py-8">No results found for &ldquo;{query}&rdquo;</p>
              )}

              {results.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-earth uppercase tracking-widest mb-4">
                    {results.length} result{results.length !== 1 ? 's' : ''}
                  </p>
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.handle}`}
                      onClick={closeSearch}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-cream-dark transition-colors group"
                    >
                      <div className="w-14 h-14 bg-cream-dark rounded overflow-hidden shrink-0">
                        <Image
                          src={product.images[0]?.src || '/images/placeholder.jpg'}
                          alt={product.title}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-charcoal group-hover:text-terracotta transition-colors truncate">
                          {product.title}
                        </h3>
                        <p className="text-xs text-earth capitalize">{product.category}</p>
                      </div>
                      <span className="font-mono text-sm text-charcoal">{formatPrice(product.price)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
    </div>
  )
}
