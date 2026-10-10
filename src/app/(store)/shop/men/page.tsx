'use client'

import { useState, useMemo } from 'react'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import ProductCard from '@/components/product/ProductCard'
import { getAllProducts } from '@/lib/data'

export default function MenShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('featured')

  // Filter products for men
  const menProducts = useMemo(() => {
    let products = getAllProducts().filter(p => p.gender === 'men')

    // Filter by sub-category
    if (selectedCategory !== 'all') {
      products = products.filter(p => p.category === selectedCategory)
    }

    // Sort
    if (sortBy === 'price-asc') {
      products.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-desc') {
      products.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'newest') {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return products
  }, [selectedCategory, sortBy])

  const categories = ['all', 'tops', 'bottoms', 'outerwear', 'shoes', 'accessories']

  return (
    <div className="min-h-screen bg-cream py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl text-charcoal mb-4">
            <TextReveal>Men's Collection</TextReveal>
          </h1>
          <FadeIn delay={0.2}>
            <p className="text-lg text-walnut max-w-2xl">
              Discover timeless pieces crafted for the modern man. From essential basics to statement outerwear.
            </p>
          </FadeIn>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-charcoal text-cream'
                    : 'bg-cream-dark text-walnut hover:bg-sand'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-cream-dark border border-earth/20 rounded-full text-sm text-walnut focus:outline-none focus:border-terracotta"
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Product Count */}
        <p className="text-sm text-earth mb-6">{menProducts.length} products</p>

        {/* Products Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {menProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Empty State */}
        {menProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-walnut text-lg">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}
