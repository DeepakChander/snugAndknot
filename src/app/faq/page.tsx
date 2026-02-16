'use client'

import { useState } from 'react'
import Link from 'next/link'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import Accordion from '@/components/ui/Accordion'
import faqData from '@/data/faq.json'

const categories = faqData.categories

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(categories[0].name)

  const currentCategory = categories.find((c) => c.name === activeCategory) || categories[0]

  return (
    <div className="pt-32 pb-20 bg-ivory min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <p className="font-mono text-xs text-gold tracking-[0.4em] uppercase mb-4">
          Untangle
        </p>
        <TextReveal
          as="h1"
          className="text-4xl sm:text-5xl text-burgundy mb-4"
        >
          Frequently Asked Questions
        </TextReveal>
        <FadeIn delay={0.1}>
          <div className="w-16 h-px bg-gold mb-6" />
          <p className="text-wine/80 leading-relaxed mb-10">
            Find answers to common questions about our products, ordering, shipping, and more.
          </p>
        </FadeIn>

        {/* Category Tabs */}
        <FadeIn delay={0.2}>
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-2 text-xs font-medium uppercase tracking-wider rounded-full border transition-all duration-300 ${
                  activeCategory === cat.name
                    ? 'bg-burgundy text-gold-pale border-burgundy'
                    : 'bg-transparent text-burgundy border-silk hover:border-gold'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Accordion */}
        <FadeIn delay={0.3}>
          <div className="bg-parchment/50 rounded-sm p-6 sm:p-8 border border-gold/10">
            <Accordion items={currentCategory.items.map((item) => ({ title: item.title, content: item.content }))} />
          </div>
        </FadeIn>

        {/* Bottom CTA */}
        <FadeIn delay={0.4}>
          <div className="mt-16 text-center p-10 bg-burgundy rounded-sm relative overflow-hidden">
            <div className="knit-pattern-gold absolute inset-0" />
            <div className="relative z-10">
              <h3 className="font-heading text-2xl text-gold-pale mb-3">
                Still have questions?
              </h3>
              <p className="text-sm text-gold-pale/60 mb-6">
                Our team is here to help with any questions you might have.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider bg-gold text-burgundy-deep hover:bg-gold-pale transition-colors duration-300"
              >
                Contact Us
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </FadeIn>

        {/* Back link */}
        <div className="mt-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm text-burgundy hover:text-gold transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="rotate-180 transition-transform duration-300 group-hover:-translate-x-1">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
