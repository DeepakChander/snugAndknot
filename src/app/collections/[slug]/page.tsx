'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getCollectionByHandle, getCollectionProducts } from '@/lib/data'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import ProductCard from '@/components/product/ProductCard'

export default function CollectionPage() {
  const params = useParams()
  const handle = params.slug as string
  const collection = getCollectionByHandle(handle)
  const products = getCollectionProducts(handle)

  if (!collection) {
    return (
      <div className="pt-32 pb-20 text-center">
        <h1 className="font-heading text-4xl text-charcoal mb-4">Collection Not Found</h1>
        <p className="text-walnut mb-6">The collection you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/shop" className="px-6 py-2.5 bg-charcoal text-cream text-sm font-medium rounded-full hover:bg-espresso transition-colors">
          Back to Shop
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20">
      {/* Collection hero */}
      <div className="relative h-[50vh] lg:h-[60vh] bg-cream-dark overflow-hidden mb-12">
        <Image
          src={collection.image}
          alt={collection.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
          <p className="text-xs font-semibold text-cream/80 uppercase tracking-[0.3em] mb-3">Collection</p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-cream mb-3">{collection.title}</h1>
          <p className="text-cream/80 max-w-lg text-lg">{collection.description}</p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial intro */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <FadeIn>
            <p className="text-walnut text-lg leading-relaxed">
              A thoughtfully curated selection of {products.length} pieces that embody the spirit
              of this collection. Each item has been chosen to complement the others perfectly.
            </p>
          </FadeIn>
        </div>

        {/* Products in editorial layout */}
        <div className="space-y-16">
          {/* First row -- large feature */}
          {products.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-1">
                <ProductCard product={products[0]} priority />
              </div>
              {products[1] && (
                <div className="lg:col-span-1 lg:pt-16">
                  <ProductCard product={products[1]} />
                </div>
              )}
            </div>
          )}

          {/* Remaining products in grid */}
          {products.length > 2 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.slice(2).map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>

        {/* Back to all collections */}
        <div className="text-center mt-16">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-charcoal border-b border-charcoal pb-1 hover:text-terracotta hover:border-terracotta transition-colors"
          >
            Shop All Products
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
