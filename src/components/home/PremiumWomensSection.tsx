'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import TextReveal from '@/components/animation/TextReveal'

const premiumProducts = [
  {
    id: "women-ivory-cable-cardigan",
    handle: "ivory-cable-knit-cardigan",
    title: "Ivory Cable Knit Cardigan",
    subtitle: "Heritage Craftsmanship",
    description: "Hand-finished with intricate cable patterns that whisper tales of heritage knitting techniques. Made from 100% premium merino wool.",
    price: 189.00,
    compareAtPrice: 249.00,
    image: "/images/products/women/ivory-cable-cardigan-1.jpg",
    features: ["100% Merino Wool", "Hand-Finished", "Organic Materials"],
    badge: "New Arrival"
  },
  {
    id: "women-terracotta-textured-cardigan",
    handle: "terracotta-textured-cardigan",
    title: "Terracotta Textured Cardigan",
    subtitle: "Autumn Essential",
    description: "Rich earthy terracotta hue with subtle diamond-textured knit. Premium cotton-cashmere blend ensures breathability and all-day comfort.",
    price: 169.00,
    compareAtPrice: 229.00,
    image: "/images/products/women/terracotta-textured-cardigan-1.jpg",
    features: ["Cotton-Cashmere", "Eco-Friendly Dye", "Bestseller"],
    badge: "Bestseller"
  }
]

export default function PremiumWomensSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-gradient-to-b from-cream to-beige overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-terracotta/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sage/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-xs font-semibold text-terracotta uppercase tracking-[0.3em] mb-4"
          >
            Premium Women's Collection
          </motion.p>
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-6">
            <TextReveal>Artisanal Knitwear</TextReveal>
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg text-walnut max-w-2xl mx-auto"
          >
            Discover our carefully curated collection of premium cardigans,
            crafted with intention and designed to be cherished for years to come.
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
              <Link
                href={`/product/${product.handle}`}
                className="group block"
              >
                {/* Image Container */}
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

                  {/* Quick View Button */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-cream text-charcoal text-sm font-medium rounded-full">
                      View Details
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div>
                  <p className="text-xs font-semibold text-terracotta uppercase tracking-[0.2em] mb-2">
                    {product.subtitle}
                  </p>
                  <h3 className="font-heading text-2xl lg:text-3xl text-charcoal mb-3 group-hover:text-terracotta transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-sm text-walnut leading-relaxed mb-4">
                    {product.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-cream-dark rounded-full text-xs text-earth"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-2xl text-charcoal">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="font-mono text-sm text-earth line-through">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-terracotta uppercase">
                      Save ${(product.compareAtPrice - product.price).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-center mt-16"
        >
          <Link
            href="/shop/women"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-charcoal text-charcoal text-sm font-medium rounded-full hover:bg-charcoal hover:text-cream transition-all duration-300"
          >
            Explore Full Women's Collection
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>

        {/* Trust Badges */}
        <div className="mt-16 pt-16 border-t border-earth/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Premium Materials', value: '100%' },
              { label: 'Handcrafted', value: 'Yes' },
              { label: 'Sustainable', value: 'Always' },
              { label: 'Customer Rating', value: '4.8★' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.8 + i * 0.1, duration: 0.6 }}
              >
                <p className="font-mono text-2xl text-terracotta mb-2">{item.value}</p>
                <p className="text-sm text-earth">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
