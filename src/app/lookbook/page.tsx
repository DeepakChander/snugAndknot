'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getAllLookbookSpreads } from '@/lib/data'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'

export default function LookbookPage() {
  const spreads = getAllLookbookSpreads()

  return (
    <div className="pt-24 pb-20">
      {/* Header */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mb-16 text-center">
        <p className="text-xs font-semibold text-terracotta uppercase tracking-[0.3em] mb-3">Editorial</p>
        <TextReveal as="h1" className="text-5xl sm:text-6xl lg:text-8xl text-charcoal mb-4">
          Lookbook
        </TextReveal>
        <FadeIn delay={0.2}>
          <p className="text-walnut text-lg max-w-lg mx-auto">
            Explore our latest editorial collections. Each spread tells a story through the lens of modern fashion.
          </p>
        </FadeIn>
      </div>

      {/* Spreads */}
      <div className="space-y-24 lg:space-y-32">
        {spreads.map((spread, spreadIndex) => (
          <section key={spread.id} className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Spread header */}
            <div className={`mb-10 ${spreadIndex % 2 === 0 ? 'text-left' : 'text-right'}`}>
              <FadeIn>
                <p className="text-xs font-semibold text-earth uppercase tracking-[0.3em] mb-2">{spread.season}</p>
                <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-3">{spread.title}</h2>
                <p className="text-sm text-earth italic">{spread.subtitle}</p>
              </FadeIn>
            </div>

            {/* Images grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              {spread.images.map((img, imgIndex) => (
                <motion.div
                  key={imgIndex}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.8, delay: imgIndex * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className={`${img.position === 'full' ? 'md:col-span-2' : ''}`}
                >
                  <div className={`relative rounded-lg overflow-hidden bg-cream-dark ${
                    img.position === 'full' ? 'aspect-[21/9]' : 'aspect-[3/4]'
                  }`}>
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover"
                      sizes={img.position === 'full' ? '100vw' : '50vw'}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Description + shop links */}
            <div className="mt-8 max-w-2xl">
              <FadeIn>
                <p className="text-walnut leading-relaxed mb-4">{spread.description}</p>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-sm font-medium text-charcoal border-b border-charcoal pb-1 hover:text-terracotta hover:border-terracotta transition-colors"
                >
                  Shop this look
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </FadeIn>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
