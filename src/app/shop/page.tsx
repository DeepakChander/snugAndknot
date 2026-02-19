'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import FloatingProductCard from '@/components/shop/FloatingProductCard'
import CurtainReveal from '@/components/shop/CurtainReveal'
import MaterialTransitions from '@/components/shop/MaterialTransitions'
import ParticleField from '@/components/shop/ParticleField'
import { filterProducts, getAllColors, getAllSizes, getPriceRange } from '@/lib/data'
import type { SortOption } from '@/types'

// Dynamic import for 3D canvas (client-side only)
const ShopHeroCanvas = dynamic(() => import('@/components/3d/ShopHeroCanvas'), {
  ssr: false,
})

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
  const [scrollProgress, setScrollProgress] = useState(0)
  const [canvasReady, setCanvasReady] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  // Track scroll progress for 3D animations
  useEffect(() => {
    setCanvasReady(true)

    const handleScroll = () => {
      if (!heroRef.current) return
      const heroHeight = heroRef.current.offsetHeight
      const scrolled = window.scrollY
      const progress = Math.min(scrolled / heroHeight, 1)
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
    <>
      {/* Material transition backgrounds */}
      <MaterialTransitions />

      {/* Ambient particle field */}
      <ParticleField />

      <div>
        {/* ============================================
            SHOP HERO -- Enhanced with 3D canvas
            ============================================ */}
        <section
          ref={heroRef}
          className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 overflow-hidden"
          style={{
            background: 'linear-gradient(170deg, #0F0A0B 0%, #3D0A0E 55%, #5B0E14 100%)',
          }}
        >
          {/* 3D Canvas with cloth, threads, and particles */}
          <ShopHeroCanvas scrollProgress={scrollProgress} isReady={canvasReady} />

          {/* Decorative knit pattern overlay */}
          <div className="absolute inset-0 knit-pattern-gold pointer-events-none opacity-30" />

          {/* Subtle gold radial glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse, rgba(241,225,148,0.08) 0%, transparent 70%)',
            }}
          />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <FadeIn delay={0.1}>
              <p
                className="text-xs sm:text-sm font-medium uppercase tracking-[0.25em] mb-4 text-gold-muted"
              >
                The Collection
              </p>
            </FadeIn>

            <TextReveal
              as="h1"
              className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] mb-6 text-gold-pale"
            >
              Shop All
            </TextReveal>

            <FadeIn delay={0.3}>
              <p
                className="text-base sm:text-lg max-w-md leading-relaxed text-silk"
              >
                Curated pieces crafted with intention. Each thread woven to tell your story.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="mt-6 flex items-center gap-3">
                <span
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border border-gold/25 text-gold bg-gold/[0.08]"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-gold"
                  />
                  {products.length} pieces
                </span>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Bottom fade into ivory */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{
            background: 'linear-gradient(to bottom, transparent, #FDF8EC)',
          }}
        />
      </section>

      {/* ============================================
          FILTER BAR -- Sticky glass-morphism
          ============================================ */}
      <div
        className="sticky top-16 lg:top-20 z-30 border-b"
        style={{
          background: 'rgba(253,248,236,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(191,168,142,0.3)',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Filter toggle button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  border: `1.5px solid ${showFilters ? '#5B0E14' : 'rgba(191,168,142,0.5)'}`,
                  color: showFilters ? '#FDF8EC' : '#5B0E14',
                  backgroundColor: showFilters ? '#5B0E14' : 'transparent',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="16" y2="12" />
                  <line x1="4" y1="18" x2="12" y2="18" />
                </svg>
                Filters
                {hasActiveFilters && (
                  <span
                    className="w-5 h-5 text-[10px] rounded-full flex items-center justify-center font-semibold bg-gold text-burgundy-deep"
                  >
                    {selectedColors.length + selectedSizes.length}
                  </span>
                )}
              </button>

              {/* Active filter pills */}
              {selectedColors.map((color) => (
                <button
                  key={`color-${color}`}
                  onClick={() => toggleColor(color)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 bg-burgundy/[0.08] text-burgundy border border-burgundy/15"
                >
                  {color}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              ))}
              {selectedSizes.map((size) => (
                <button
                  key={`size-${size}`}
                  onClick={() => toggleSize(size)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 bg-burgundy/[0.08] text-burgundy border border-burgundy/15"
                >
                  Size: {size}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              ))}

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-medium transition-colors underline underline-offset-2 text-wine hover:text-burgundy"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-9 py-2 rounded-full text-sm font-medium bg-transparent focus:outline-none cursor-pointer transition-all duration-300 text-burgundy border-[1.5px] border-dust/50 focus:border-burgundy"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-burgundy"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Expanded filter panel */}
          <div
            className="grid transition-all duration-350 ease-out overflow-hidden"
            style={{
              gridTemplateRows: showFilters ? '1fr' : '0fr',
              opacity: showFilters ? 1 : 0,
            }}
          >
            <div className="overflow-hidden">
              <div className="pt-6 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Colors */}
                <div role="group" aria-label="Filter by color">
                  <h3
                    className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3 text-rosewood"
                  >
                    Color
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => toggleColor(color)}
                        aria-pressed={selectedColors.includes(color)}
                        className="px-3 py-1.5 text-xs rounded-full transition-all duration-200"
                        style={{
                          border: `1.5px solid ${
                            selectedColors.includes(color) ? '#5B0E14' : 'rgba(191,168,142,0.4)'
                          }`,
                          backgroundColor: selectedColors.includes(color) ? '#5B0E14' : 'transparent',
                          color: selectedColors.includes(color) ? '#FAF0C8' : '#8B2E35',
                        }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div role="group" aria-label="Filter by size">
                  <h3
                    className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3 text-rosewood"
                  >
                    Size
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        aria-pressed={selectedSizes.includes(size)}
                        className="w-10 h-10 text-xs rounded-full flex items-center justify-center transition-all duration-200 font-medium"
                        style={{
                          border: `1.5px solid ${
                            selectedSizes.includes(size) ? '#5B0E14' : 'rgba(191,168,142,0.4)'
                          }`,
                          backgroundColor: selectedSizes.includes(size) ? '#5B0E14' : 'transparent',
                          color: selectedSizes.includes(size) ? '#FAF0C8' : '#8B2E35',
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range info */}
                <div>
                  <h3
                    className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3 text-rosewood"
                  >
                    Price Range
                  </h3>
                  <p className="text-sm text-wine">
                    <span className="font-mono">${minPrice.toFixed(0)}</span>
                    <span className="mx-2 text-dust">&mdash;</span>
                    <span className="font-mono">${maxPrice.toFixed(0)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          PRODUCT GRID -- Ivory background, clean layout
          ============================================ */}
      <section
        className="py-10 sm:py-14 bg-ivory"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results summary bar */}
          <FadeIn delay={0.1}>
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-wine">
                Showing{' '}
                <span className="font-semibold text-burgundy">
                  {products.length}
                </span>{' '}
                {products.length === 1 ? 'piece' : 'pieces'}
                {hasActiveFilters && (
                  <span className="text-dust"> (filtered)</span>
                )}
              </p>

              {/* View mode indicator (decorative) */}
              <div className="hidden sm:flex items-center gap-1">
                <span
                  className="w-7 h-7 rounded flex items-center justify-center bg-burgundy/[0.08]"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" className="text-burgundy">
                    <rect x="0" y="0" width="7" height="7" rx="1" />
                    <rect x="9" y="0" width="7" height="7" rx="1" />
                    <rect x="0" y="9" width="7" height="7" rx="1" />
                    <rect x="9" y="9" width="7" height="7" rx="1" />
                  </svg>
                </span>
              </div>
            </div>
          </FadeIn>

          {/* Grid with curtain reveal and floating cards */}
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10"
          >
            {products.map((product, i) => (
              <CurtainReveal key={product.id} index={i}>
                <FloatingProductCard product={product} index={i} priority={i < 8} />
              </CurtainReveal>
            ))}
          </div>

          {/* Empty state */}
          {products.length === 0 && (
            <div className="text-center py-24">
              {/* Empty state icon */}
              <div
                className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-burgundy/[0.06] text-wine"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              <p
                className="font-heading text-xl sm:text-2xl mb-2 text-burgundy"
              >
                No pieces found
              </p>
              <p
                className="text-sm mb-8 max-w-xs mx-auto text-wine"
              >
                Try adjusting your filters to discover more from our collection
              </p>

              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-7 py-3 text-sm font-medium rounded-full transition-all duration-300 bg-burgundy text-gold-pale hover:bg-burgundy-deep"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
      </div>
    </>
  )
}
