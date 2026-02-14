'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import TextReveal from '@/components/animation/TextReveal'

const premiumProducts = [
  {
    id: 'men-black-red-contrast-tee',
    handle: 'black-red-contrast-knit-tee',
    title: 'Noir & Crimson Contrast Knit Tee',
    subtitle: 'Bold Statement',
    description: 'Jet-black body with bold crimson shoulder panels. Superfine merino-cotton blend that drapes with refined weight.',
    price: 129.0,
    compareAtPrice: 179.0,
    image: '/images/products/men/black-red-contrast-tee-1.jpg',
    features: ['Merino-Cotton Blend', 'Contrast Panelling', 'Athletic Fit'],
    badge: 'New Arrival',
  },
  {
    id: 'men-navy-tan-colorblock-tee',
    handle: 'navy-tan-colorblock-knit-tee',
    title: 'Dusk & Sand Colorblock Knit Tee',
    subtitle: 'Modern Minimalism',
    description: 'Deep midnight navy meets rich sand tones in a striking vertical panel design. Long-staple cotton with silk sheen.',
    price: 139.0,
    compareAtPrice: 189.0,
    image: '/images/products/men/navy-tan-colorblock-tee-1.jpg',
    features: ['Cotton-Silk Blend', 'Vertical Panel', 'Bestseller'],
    badge: 'Bestseller',
  },
]

export default function PremiumMensSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-gradient-to-b from-beige to-cream overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-charcoal/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-terracotta/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-xs font-semibold text-charcoal uppercase tracking-[0.3em] mb-4"
          >
            Premium Men's Collection
          </motion.p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-6">
            <TextReveal>Crafted for Him</TextReveal>
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg text-walnut max-w-2xl mx-auto"
          >
            Premium knit tees that bridge the gap between casual comfort
            and understated sophistication. Built to outlast trends.
          </motion.p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {premiumProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/product/${product.handle}`} className="group block">
                {/* Image */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-6 bg-sand">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover transition-all duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />

                  {/* Badge */}
                  <div className="absolute top-4 left-4 px-4 py-2 bg-charcoal/80 backdrop-blur-sm rounded-full">
                    <span className="text-xs font-medium text-cream">{product.badge}</span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Quick View */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-cream text-charcoal text-sm font-medium rounded-full">
                      View Details
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <p className="text-xs font-semibold text-charcoal/60 uppercase tracking-[0.2em] mb-2">
                    {product.subtitle}
                  </p>
                  <h3 className="font-heading text-2xl lg:text-3xl text-charcoal mb-3 group-hover:text-terracotta transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-sm text-walnut leading-relaxed mb-4">{product.description}</p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.features.map((f, idx) => (
                      <span key={idx} className="px-3 py-1 bg-cream-dark rounded-full text-xs text-earth">
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-2xl text-charcoal">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="font-mono text-sm text-earth line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-semibold text-terracotta uppercase">
                      Save ${(product.compareAtPrice - product.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-center mt-16"
        >
          <Link
            href="/shop/men"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-charcoal text-charcoal text-sm font-medium rounded-full hover:bg-charcoal hover:text-cream transition-all duration-300"
          >
            Explore Full Men's Collection
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
