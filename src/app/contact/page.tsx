'use client'

import { useState } from 'react'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import { useUIStore } from '@/stores/ui-store'
import { getSiteConfig } from '@/lib/data'

export default function ContactPage() {
  const config = getSiteConfig()
  const addToast = useUIStore((s) => s.addToast)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addToast('Message sent! We\'ll get back to you soon.')
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold text-terracotta uppercase tracking-[0.3em] mb-3">Get in Touch</p>
          <TextReveal as="h1" className="text-5xl sm:text-6xl lg:text-7xl text-charcoal mb-4">
            Contact Us
          </TextReveal>
          <FadeIn delay={0.2}>
            <p className="text-walnut text-lg max-w-lg mx-auto">
              We&apos;d love to hear from you. Send us a message and we&apos;ll get back to you within 24 hours.
            </p>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* Contact form */}
          <FadeIn>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-charcoal mb-1.5">Name</label>
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-transparent border border-beige rounded-lg text-sm text-charcoal placeholder:text-sand focus:outline-none focus:border-charcoal transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-charcoal mb-1.5">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-transparent border border-beige rounded-lg text-sm text-charcoal placeholder:text-sand focus:outline-none focus:border-charcoal transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-charcoal mb-1.5">Subject</label>
                <input
                  id="subject"
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-transparent border border-beige rounded-lg text-sm text-charcoal placeholder:text-sand focus:outline-none focus:border-charcoal transition-colors"
                  placeholder="How can we help?"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-charcoal mb-1.5">Message</label>
                <textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-transparent border border-beige rounded-lg text-sm text-charcoal placeholder:text-sand focus:outline-none focus:border-charcoal transition-colors resize-none"
                  placeholder="Your message..."
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 bg-charcoal text-cream text-sm font-medium rounded-full hover:bg-espresso transition-colors"
              >
                Send Message
              </button>
            </form>
          </FadeIn>

          {/* Contact info */}
          <FadeIn delay={0.2}>
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-semibold text-earth uppercase tracking-[0.2em] mb-3">Visit Us</h3>
                <p className="text-walnut leading-relaxed">
                  {config.address.street}<br />
                  {config.address.city}, {config.address.state} {config.address.zip}<br />
                  {config.address.country}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-earth uppercase tracking-[0.2em] mb-3">Contact</h3>
                <p className="text-walnut">
                  <a href={`mailto:${config.email}`} className="hover:text-charcoal transition-colors">{config.email}</a>
                </p>
                <p className="text-walnut mt-1">{config.phone}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-earth uppercase tracking-[0.2em] mb-3">Hours</h3>
                <p className="text-walnut leading-relaxed">
                  Monday &ndash; Friday: 10am &ndash; 7pm<br />
                  Saturday: 11am &ndash; 6pm<br />
                  Sunday: 12pm &ndash; 5pm
                </p>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-earth uppercase tracking-[0.2em] mb-3">Follow Us</h3>
                <div className="flex gap-4">
                  {Object.entries(config.social).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-walnut hover:text-charcoal transition-colors capitalize"
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
