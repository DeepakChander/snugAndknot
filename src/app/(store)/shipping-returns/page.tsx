'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'

gsap.registerPlugin(ScrollTrigger)

const ShippingScene = dynamic(() => import('@/components/3d/ShippingScene'), {
  ssr: false,
  loading: () => null,
})

const shippingMethods = [
  {
    method: 'Standard',
    time: '5–7 business days',
    cost: 'Free over $100 / $8.95',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <path d="M16 8h4l3 3v5h-3" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    method: 'Express',
    time: '2–3 business days',
    cost: '$14.95',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    method: 'Next Day',
    time: '1 business day',
    cost: '$24.95',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    method: 'International',
    time: '7–14 business days',
    cost: 'Calculated at checkout',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
]

const journeySteps = [
  {
    phase: 'Order Placed',
    title: 'Your Journey Begins',
    description: 'Order confirmation sent instantly. Our team receives your order and begins preparation.',
    time: '0 min',
    color: 'from-burgundy/20 to-burgundy/5',
  },
  {
    phase: 'Processing',
    title: 'Careful Preparation',
    description: 'Each piece is inspected, folded with tissue paper, and wrapped in our signature packaging.',
    time: '2–4 hours',
    color: 'from-gold/20 to-gold/5',
  },
  {
    phase: 'In Transit',
    title: 'On Its Way',
    description: 'Your package travels with carbon-neutral shipping. Track in real-time through your account.',
    time: '1–7 days',
    color: 'from-wine/20 to-wine/5',
  },
  {
    phase: 'Delivered',
    title: 'Welcome Home',
    description: 'Your Snug&Knot pieces arrive. Unbox, enjoy, and begin your story with sustainable luxury.',
    time: 'Final',
    color: 'from-success-moss/20 to-success-moss/5',
  },
]

const returnSteps = [
  {
    step: '01',
    title: 'Initiate',
    description: 'Log into your account, find your order, and select "Initiate Return." You\'ll receive a prepaid shipping label via email within 24 hours.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Pack',
    description: 'Place items in their original packaging or a secure alternative. Include the return slip from your order. Ensure items are unworn with tags attached.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Ship',
    description: 'Drop off your return at any carrier location using the prepaid label. You\'ll receive tracking confirmation automatically.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" />
        <path d="M16 8h4l3 3v5h-3" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Refund',
    description: 'Refunds are processed within 5–7 business days after we receive your return. The amount is credited to your original payment method.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <path d="M1 10h22" />
      </svg>
    ),
  },
]

export default function ShippingReturnsPage() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeJourney, setActiveJourney] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const journeyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(scrolled / maxScroll)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Journey timeline animation
      const journeyItems = document.querySelectorAll('.journey-item')
      journeyItems.forEach((item, index) => {
        gsap.fromTo(
          item,
          {
            opacity: 0,
            x: index % 2 === 0 ? -100 : 100,
            rotateY: index % 2 === 0 ? -15 : 15,
          },
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              end: 'top 50%',
              scrub: 1,
              onEnter: () => setActiveJourney(index),
            },
          }
        )
      })

      // Shipping cards 3D hover effect
      const cards = document.querySelectorAll('.shipping-card')
      cards.forEach((card) => {
        const element = card as HTMLElement

        element.addEventListener('mouseenter', () => {
          gsap.to(element, {
            scale: 1.05,
            rotateY: 5,
            z: 50,
            duration: 0.4,
            ease: 'power2.out',
          })
        })

        element.addEventListener('mouseleave', () => {
          gsap.to(element, {
            scale: 1,
            rotateY: 0,
            z: 0,
            duration: 0.4,
            ease: 'power2.out',
          })
        })
      })

      // Return steps stagger animation
      gsap.fromTo(
        '.return-step',
        { opacity: 0, y: 60, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: '.returns-section',
            start: 'top 70%',
          },
        }
      )
    })

    return () => ctx.revert()
  }, [])

  return (
    <div className="relative bg-ivory min-h-screen overflow-hidden">
      {/* Hero Section with 3D Background */}
      <div ref={heroRef} className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8" style={{ perspective: '1000px' }}>
        {/* 3D Scene Background */}
        <div className="absolute inset-0 opacity-40">
          <ShippingScene scrollProgress={scrollProgress} />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory/95 to-ivory/90 pointer-events-none" />
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #D4A843 0%, transparent 70%)' }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <FadeIn delay={0.1}>
            <p className="font-mono text-xs text-gold tracking-[0.4em] uppercase mb-6">
              Logistics & Care
            </p>
          </FadeIn>

          <TextReveal
            as="h1"
            className="text-5xl sm:text-6xl lg:text-7xl text-burgundy mb-6 font-heading"
          >
            Shipping & Returns
          </TextReveal>

          <FadeIn delay={0.2}>
            <p className="text-lg sm:text-xl text-wine/80 leading-relaxed max-w-2xl mx-auto mb-8">
              We deliver sustainable luxury worldwide with care, precision, and carbon-neutral shipping.
              Your satisfaction is woven into every step.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="inline-block w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          </FadeIn>
        </div>
      </div>

      {/* Shipping Methods - 3D Cards */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <FadeIn delay={0.1}>
          <h2 className="font-heading text-3xl sm:text-4xl text-burgundy mb-4 text-center">
            Choose Your Speed
          </h2>
          <p className="text-center text-wine/70 mb-12 max-w-2xl mx-auto">
            Orders placed before 2 PM EST ship the same business day from our fulfillment center in New York.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" style={{ perspective: '1500px' }}>
          {shippingMethods.map((method, index) => (
            <FadeIn key={method.method} delay={0.15 + index * 0.1}>
              <div
                className="shipping-card relative group overflow-hidden rounded-lg border border-gold/20 bg-gradient-to-br from-parchment/80 to-ivory/60 backdrop-blur-sm p-6 cursor-pointer transition-all duration-500 hover:border-gold/40 hover:shadow-2xl"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-burgundy/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Icon */}
                <div className="relative w-16 h-16 mb-4 text-burgundy transform group-hover:scale-110 transition-transform duration-300">
                  {method.icon}
                </div>

                {/* Method name */}
                <h3 className="relative font-heading text-2xl text-burgundy mb-2">
                  {method.method}
                </h3>

                {/* Time */}
                <p className="relative text-sm text-wine/60 mb-3 font-mono tracking-wider">
                  {method.time}
                </p>

                {/* Cost */}
                <div className="relative">
                  <div className="inline-block px-4 py-2 bg-burgundy/90 text-gold-pale text-sm font-semibold rounded-full group-hover:bg-burgundy transition-colors duration-300">
                    {method.cost}
                  </div>
                </div>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gold/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Additional Info */}
        <FadeIn delay={0.5}>
          <div className="mt-12 p-8 bg-gradient-to-r from-burgundy/5 via-gold/5 to-burgundy/5 rounded-lg border border-gold/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-wine/80 leading-relaxed">
              <div>
                <h4 className="text-burgundy font-semibold mb-2 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" />
                    <path d="M2 12h20" />
                  </svg>
                  International Shipping
                </h4>
                <p>
                  We ship to over 40 countries. International customers may be subject to import duties and taxes,
                  which are the responsibility of the recipient.
                </p>
              </div>
              <div>
                <h4 className="text-burgundy font-semibold mb-2 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Order Tracking
                </h4>
                <p>
                  A tracking number is emailed once your order ships. Track your package in real-time through
                  your account dashboard or the carrier's website.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Journey Timeline */}
      <div ref={journeyRef} className="relative py-20 overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #5B0E14 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn delay={0.1}>
            <h2 className="font-heading text-3xl sm:text-4xl text-burgundy mb-4 text-center">
              Your Package Journey
            </h2>
            <p className="text-center text-wine/70 mb-16 max-w-2xl mx-auto">
              Every order follows a thoughtful path from our hands to yours
            </p>
          </FadeIn>

          <div className="relative" style={{ perspective: '2000px' }}>
            {/* Connecting line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/30 via-burgundy/30 to-gold/30 hidden lg:block" />

            {journeySteps.map((step, index) => (
              <div
                key={step.phase}
                className="journey-item relative mb-16 last:mb-0"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  {/* Content Card */}
                  <div className="flex-1 w-full">
                    <div className={`p-8 rounded-xl bg-gradient-to-br ${step.color} border border-gold/20 backdrop-blur-sm shadow-lg transform transition-all duration-500 hover:scale-105 hover:shadow-2xl`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-heading text-2xl text-burgundy">
                          {step.title}
                        </h3>
                        <span className="text-xs font-mono text-gold tracking-wider bg-gold/10 px-3 py-1 rounded-full">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-burgundy/60 uppercase tracking-wider mb-2">
                        {step.phase}
                      </p>
                      <p className="text-wine/80 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Circle */}
                  <div className="hidden lg:block relative">
                    <div className={`w-16 h-16 rounded-full border-4 ${activeJourney === index ? 'border-gold bg-burgundy scale-110' : 'border-gold/30 bg-parchment'} flex items-center justify-center font-heading text-xl transition-all duration-500 shadow-lg`}>
                      <span className={activeJourney === index ? 'text-gold' : 'text-burgundy/40'}>
                        {index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1 hidden lg:block" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      {/* Returns Section */}
      <div className="returns-section relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <FadeIn delay={0.1}>
            <h2 className="font-heading text-3xl sm:text-4xl text-burgundy mb-4 text-center">
              Hassle-Free Returns
            </h2>
            <p className="text-center text-wine/70 mb-12 max-w-2xl mx-auto">
              We want you to love every piece. If something doesn't work out,
              we offer a straightforward 30-day return policy on all regular-priced items.
            </p>
          </FadeIn>

          {/* Policy Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
            {[
              {
                title: '30-Day Window',
                desc: 'Return unworn items with tags within 30 days for a full refund.',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                ),
              },
              {
                title: 'Free Returns',
                desc: 'Domestic returns are free. We provide a prepaid shipping label.',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
                    <path d="M12 3v13M5 10l7-7 7 7" />
                  </svg>
                ),
              },
              {
                title: 'Sale Items',
                desc: 'Sale items can be returned within 14 days for store credit only.',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                ),
              },
              {
                title: 'Exchanges',
                desc: 'Need a different size? Exchanges are always free and prioritized.',
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 7l5-5 5 5M8 2v10.93M21 17l-5 5-5-5M16 22V11" />
                  </svg>
                ),
              },
            ].map((item, index) => (
              <FadeIn key={item.title} delay={0.15 + index * 0.1}>
                <div className="group p-6 bg-gradient-to-br from-parchment/60 to-ivory/40 border border-gold/15 rounded-lg hover:border-gold/40 hover:shadow-xl transition-all duration-500 cursor-pointer">
                  <div className="w-12 h-12 mb-3 text-burgundy transform group-hover:scale-110 transition-transform duration-300">
                    {item.icon}
                  </div>
                  <h3 className="font-heading text-xl text-burgundy mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-wine/70 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Return Steps */}
          <div className="space-y-6">
            <h3 className="font-heading text-2xl text-burgundy mb-8 text-center">
              How to Return
            </h3>

            {returnSteps.map((item, index) => (
              <div
                key={item.step}
                className="return-step flex gap-6 p-6 bg-gradient-to-r from-parchment/40 via-ivory/30 to-parchment/40 border border-gold/10 rounded-xl hover:border-gold/30 hover:shadow-lg transition-all duration-500"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Step number & icon */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <span className="font-mono text-sm text-gold font-bold w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center border border-gold/20">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 text-burgundy/70">
                    {item.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h4 className="font-heading text-xl text-burgundy mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-wine/70 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <FadeIn delay={0.2}>
          <div className="relative overflow-hidden rounded-2xl border border-gold/30 shadow-2xl group">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-burgundy via-burgundy-deep to-noir" />
            <div
              className="knit-pattern-gold absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-700"
            />

            {/* Glow effect */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-700"
              style={{ background: 'radial-gradient(circle, #D4A843 0%, transparent 70%)' }}
            />

            {/* Content */}
            <div className="relative z-10 text-center p-12">
              <h3 className="font-heading text-3xl sm:text-4xl text-gold-pale mb-4">
                Need Help With Your Order?
              </h3>
              <p className="text-gold-pale/70 mb-8 max-w-xl mx-auto">
                Our team is available Monday–Friday, 9 AM – 6 PM EST. We're here to ensure your experience is seamless.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 px-10 py-4 text-sm font-semibold uppercase tracking-wider bg-gold text-burgundy-deep hover:bg-gold-pale hover:scale-105 transition-all duration-300 rounded-full shadow-lg hover:shadow-2xl"
              >
                Contact Us
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm text-burgundy hover:text-gold transition-colors duration-300"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="rotate-180 transition-transform duration-300 group-hover:-translate-x-1"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
