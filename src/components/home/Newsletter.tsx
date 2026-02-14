'use client'

import { useState } from 'react'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import { useUIStore } from '@/stores/ui-store'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const addToast = useUIStore((s) => s.addToast)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      addToast('Thank you for subscribing!')
      setEmail('')
    }
  }

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Knit pattern background */}
      <div className="absolute inset-0 knit-pattern opacity-30" />

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <TextReveal as="h2" className="text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-4">
            Stay in the Loop
          </TextReveal>
          <FadeIn delay={0.2}>
            <p className="text-walnut mb-8 max-w-md mx-auto">
              Be the first to know about new arrivals, exclusive offers, and styling inspiration.
            </p>
          </FadeIn>
          <FadeIn delay={0.3}>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="flex-1 px-5 py-3 bg-cream border border-beige rounded-full text-sm text-charcoal placeholder:text-sand focus:outline-none focus:border-charcoal transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-charcoal text-cream text-sm font-medium rounded-full hover:bg-espresso transition-colors shrink-0"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-earth mt-4">
              No spam, ever. Unsubscribe anytime.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
