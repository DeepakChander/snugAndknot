'use client'

import Link from 'next/link'
import Image from 'next/image'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import { getAllCategories } from '@/lib/data'

export default function CategoryGrid() {
  const categories = getAllCategories()

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <TextReveal as="h2" className="text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-4">
            Shop by Category
          </TextReveal>
          <FadeIn delay={0.2}>
            <p className="text-walnut max-w-md mx-auto">
              Discover our carefully curated collections, designed for every moment.
            </p>
          </FadeIn>
        </div>

        {/* Asymmetric grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {/* First large item */}
          <CategoryCard
            category={categories[0]}
            className="col-span-2 row-span-2 aspect-[4/5]"
            index={0}
          />
          {/* Smaller items */}
          {categories.slice(1, 5).map((cat, i) => (
            <CategoryCard
              key={cat.slug}
              category={cat}
              className="aspect-[3/4]"
              index={i + 1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function CategoryCard({
  category,
  className = '',
  index = 0,
}: {
  category: { slug: string; title: string; image: string }
  className?: string
  index?: number
}) {
  return (
    <FadeIn variant="fade-up" delay={index * 0.1} className={className}>
      <Link
        href={`/shop/${category.slug}`}
        className="group relative block w-full h-full rounded-lg overflow-hidden bg-cream-dark"
      >
        <Image
          src={category.image}
          alt={category.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 1024px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl text-cream">{category.title}</h3>
          <span className="inline-flex items-center gap-1 text-xs text-cream/80 mt-1 group-hover:gap-2 transition-all">
            Shop Now
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    </FadeIn>
  )
}
