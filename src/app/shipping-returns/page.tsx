import Link from 'next/link'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'

const shippingMethods = [
  { method: 'Standard', time: '5–7 business days', cost: 'Free over $100 / $8.95' },
  { method: 'Express', time: '2–3 business days', cost: '$14.95' },
  { method: 'Next Day', time: '1 business day', cost: '$24.95' },
  { method: 'International', time: '7–14 business days', cost: 'Calculated at checkout' },
]

const returnSteps = [
  { step: '01', title: 'Initiate', description: 'Log into your account, find your order, and select "Initiate Return." You\'ll receive a prepaid shipping label via email within 24 hours.' },
  { step: '02', title: 'Pack', description: 'Place items in their original packaging or a secure alternative. Include the return slip from your order. Ensure items are unworn with tags attached.' },
  { step: '03', title: 'Ship', description: 'Drop off your return at any carrier location using the prepaid label. You\'ll receive tracking confirmation automatically.' },
  { step: '04', title: 'Refund', description: 'Refunds are processed within 5–7 business days after we receive your return. The amount is credited to your original payment method.' },
]

export default function ShippingReturnsPage() {
  return (
    <div className="pt-32 pb-20 bg-ivory min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <p className="font-mono text-xs text-gold tracking-[0.4em] uppercase mb-4">
          Logistics
        </p>
        <TextReveal
          as="h1"
          className="text-4xl sm:text-5xl text-burgundy mb-4"
        >
          Shipping & Returns
        </TextReveal>
        <FadeIn delay={0.1}>
          <div className="w-16 h-px bg-gold mb-12" />
        </FadeIn>

        {/* Shipping Section */}
        <FadeIn delay={0.15}>
          <section className="mb-16">
            <h2 className="font-heading text-2xl text-burgundy mb-6">Shipping</h2>

            <p className="text-wine/80 leading-relaxed mb-6">
              We ship worldwide from our fulfillment center in New York. All orders are carbon-neutral through our verified offset program. Orders placed before 2 PM EST ship the same business day.
            </p>

            {/* Shipping Methods Table */}
            <div className="overflow-hidden border border-gold/10 rounded-sm mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-burgundy text-gold-pale">
                    <th className="text-left px-5 py-3 font-medium uppercase tracking-wider text-xs">Method</th>
                    <th className="text-left px-5 py-3 font-medium uppercase tracking-wider text-xs">Delivery Time</th>
                    <th className="text-left px-5 py-3 font-medium uppercase tracking-wider text-xs">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold/10">
                  {shippingMethods.map((row) => (
                    <tr key={row.method} className="bg-parchment/30">
                      <td className="px-5 py-3 text-burgundy font-medium">{row.method}</td>
                      <td className="px-5 py-3 text-wine/80">{row.time}</td>
                      <td className="px-5 py-3 text-wine/80">{row.cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 text-sm text-wine/80 leading-relaxed">
              <p>
                <strong className="text-burgundy">International Shipping:</strong> We ship to over 40 countries. International customers may be subject to import duties and taxes, which are the responsibility of the recipient and are not included in our pricing.
              </p>
              <p>
                <strong className="text-burgundy">Order Tracking:</strong> A tracking number is emailed to you once your order ships. Track your package in real-time through your account dashboard or the carrier&apos;s website.
              </p>
            </div>
          </section>
        </FadeIn>

        {/* Divider */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent mb-16" />

        {/* Returns Section */}
        <FadeIn delay={0.2}>
          <section className="mb-16">
            <h2 className="font-heading text-2xl text-burgundy mb-6">Returns</h2>

            <p className="text-wine/80 leading-relaxed mb-8">
              We want you to love every piece. If something doesn&apos;t work out, we offer a straightforward 30-day return policy on all regular-priced items.
            </p>

            {/* Return Policy Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div className="p-5 bg-parchment/50 border border-gold/10 rounded-sm">
                <h3 className="font-heading text-lg text-burgundy mb-1">30-Day Window</h3>
                <p className="text-sm text-wine/70">Return unworn items with tags within 30 days for a full refund.</p>
              </div>
              <div className="p-5 bg-parchment/50 border border-gold/10 rounded-sm">
                <h3 className="font-heading text-lg text-burgundy mb-1">Free Returns</h3>
                <p className="text-sm text-wine/70">Domestic returns are free. We provide a prepaid shipping label.</p>
              </div>
              <div className="p-5 bg-parchment/50 border border-gold/10 rounded-sm">
                <h3 className="font-heading text-lg text-burgundy mb-1">Sale Items</h3>
                <p className="text-sm text-wine/70">Sale items can be returned within 14 days for store credit only.</p>
              </div>
              <div className="p-5 bg-parchment/50 border border-gold/10 rounded-sm">
                <h3 className="font-heading text-lg text-burgundy mb-1">Exchanges</h3>
                <p className="text-sm text-wine/70">Need a different size? Exchanges are always free and prioritized.</p>
              </div>
            </div>

            {/* Return Steps */}
            <h3 className="font-heading text-lg text-burgundy mb-6">How to Return</h3>
            <div className="space-y-6">
              {returnSteps.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <span className="font-mono text-sm text-gold font-bold shrink-0 w-8 pt-0.5">{item.step}</span>
                  <div>
                    <h4 className="font-heading text-base text-burgundy mb-1">{item.title}</h4>
                    <p className="text-sm text-wine/70 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Bottom CTA */}
        <FadeIn delay={0.25}>
          <div className="text-center p-10 bg-burgundy rounded-sm relative overflow-hidden">
            <div className="knit-pattern-gold absolute inset-0" />
            <div className="relative z-10">
              <h3 className="font-heading text-2xl text-gold-pale mb-3">
                Need help with your order?
              </h3>
              <p className="text-sm text-gold-pale/60 mb-6">
                Our team is available Monday–Friday, 9 AM – 6 PM EST.
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
