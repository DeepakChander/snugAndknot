'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import FloatingInput from '@/components/checkout/FloatingInput'
import { useUIStore } from '@/stores/ui-store'
import { getSiteConfig } from '@/lib/data'

gsap.registerPlugin(ScrollTrigger)

/* ─── Floating-label textarea ─── */
function FloatingTextarea({
  id,
  label,
  value,
  onChange,
  rows = 5,
  required = true,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  rows?: number
  required?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const active = focused || value.length > 0

  return (
    <div className="relative">
      <div className="absolute bottom-0 left-0 right-0 h-px bg-dust/40" />
      <div
        className="absolute bottom-0 left-0 h-px origin-left transition-transform duration-400 bg-gold"
        style={{
          transform: focused ? 'scaleX(1)' : 'scaleX(0)',
          transitionTimingFunction: 'cubic-bezier(0.22, 0.68, 0.36, 1.0)',
        }}
      />

      <label
        htmlFor={id}
        className="absolute left-0 top-0 pointer-events-none origin-left transition-all duration-250"
        style={{
          color: focused ? 'var(--color-gold)' : 'var(--color-dust)',
          transform: active ? 'translateY(-4px) scale(0.75)' : 'translateY(12px) scale(1)',
          opacity: active ? 1 : 0.6,
          transitionTimingFunction: 'cubic-bezier(0.22, 0.68, 0.36, 1.0)',
        }}
      >
        <span className="text-sm tracking-wide">{label}</span>
      </label>

      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        rows={rows}
        className="w-full bg-transparent pt-5 pb-3 text-wine text-sm outline-none resize-none placeholder-transparent"
        placeholder={label}
      />
    </div>
  )
}

/* ─── Checkmark SVG icon ─── */
function CheckmarkIcon() {
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (!pathRef.current) return
    const path = pathRef.current
    const length = path.getTotalLength()
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 0.4,
      delay: 0.15,
      ease: 'power3.out',
    })
  }, [])

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        ref={pathRef}
        d="M4 10.5L8 14.5L16 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ─── Contact info line item ─── */
function InfoBlock({
  heading,
  children,
  delay = 0,
}: {
  heading: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <FadeIn delay={delay}>
      <div>
        <h3
          className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-3 text-gold"
        >
          {heading}
        </h3>
        <div className="text-sm leading-relaxed text-parchment">
          {children}
        </div>
      </div>
    </FadeIn>
  )
}

/* ═══════════════════════════════════════════
   Contact Page
   ═══════════════════════════════════════════ */
export default function ContactPage() {
  const config = getSiteConfig()
  const addToast = useUIStore((s) => s.addToast)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const goldThreadRef = useRef<HTMLDivElement>(null)
  const bottomDecoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (submitTimerRef.current) clearTimeout(submitTimerRef.current)
    }
  }, [])

  // GSAP for the gold thread line and bottom deco
  useEffect(() => {
    if (goldThreadRef.current) {
      gsap.fromTo(
        goldThreadRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: goldThreadRef.current,
            start: 'top 85%',
            once: true,
          },
        }
      )
    }

    if (bottomDecoRef.current) {
      gsap.fromTo(
        bottomDecoRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: bottomDecoRef.current,
            start: 'top 90%',
            once: true,
          },
        }
      )
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (
          t.trigger === goldThreadRef.current ||
          t.trigger === bottomDecoRef.current
        ) {
          t.kill()
        }
      })
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    addToast('Message sent! We\'ll get back to you soon.')

    submitTimerRef.current = setTimeout(() => {
      setSubmitted(false)
      setForm({ name: '', email: '', subject: '', message: '' })
    }, 2400)
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-ivory">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Header ─── */}
        <div className="text-center mb-20">
          <FadeIn>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.35em] mb-4 text-gold-muted"
            >
              Get in Touch
            </p>
          </FadeIn>
          <TextReveal as="h1" className="text-5xl sm:text-6xl lg:text-7xl text-burgundy mb-5 font-heading">
            Contact Us
          </TextReveal>
          <FadeIn delay={0.2}>
            <p className="text-wine text-lg max-w-lg mx-auto leading-relaxed">
              We&apos;d love to hear from you. Send us a message and we&apos;ll get back to you within 24 hours.
            </p>
          </FadeIn>
        </div>

        {/* ─── Two-column layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 max-w-6xl mx-auto overflow-hidden rounded-2xl shadow-2xl">

          {/* ── LEFT: Form ── */}
          <FadeIn className="relative">
            <div
              className="h-full p-8 sm:p-12 lg:p-14 bg-ivory"
            >
              {/* Subtle knit pattern overlay */}
              <div
                className="absolute inset-0 pointer-events-none knit-pattern"
                style={{ opacity: 0.03 }}
              />

              <div className="relative z-10">
                <FadeIn delay={0.15}>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-1 text-gold-muted"
                  >
                    Send a Message
                  </p>
                </FadeIn>
                <h2
                  className="text-2xl sm:text-3xl font-heading mb-10 text-burgundy"
                >
                  We&apos;re listening
                </h2>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
                    <FloatingInput
                      name="name"
                      label="Your Name"
                      variant="underline"
                      value={form.name}
                      onChange={(v) => setForm({ ...form, name: v })}
                    />
                    <FloatingInput
                      name="email"
                      label="Email Address"
                      type="email"
                      variant="underline"
                      value={form.email}
                      onChange={(v) => setForm({ ...form, email: v })}
                    />
                  </div>

                  <FloatingInput
                    name="subject"
                    label="Subject"
                    variant="underline"
                    value={form.subject}
                    onChange={(v) => setForm({ ...form, subject: v })}
                  />

                  <FloatingTextarea
                    id="message"
                    label="Your Message"
                    value={form.message}
                    onChange={(v) => setForm({ ...form, message: v })}
                    rows={5}
                  />

                  {/* Submit button with crossfade to checkmark */}
                  <button
                    type="submit"
                    disabled={submitted}
                    className="relative w-full sm:w-auto px-10 py-4 rounded-full text-sm font-medium overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(91,14,20,0.25)] active:scale-[0.98]"
                    style={{
                      backgroundColor: submitted ? '#5A7A52' : 'var(--color-burgundy)',
                      color: 'var(--color-gold-pale)',
                    }}
                  >
                    <span
                      className={`flex items-center justify-center gap-2 transition-all duration-250 ${
                        submitted
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-2 absolute inset-0 items-center justify-center'
                      }`}
                    >
                      {submitted && <CheckmarkIcon />}
                      <span>Sent</span>
                    </span>
                    <span
                      className={`inline-block transition-all duration-250 ${
                        submitted
                          ? 'opacity-0 -translate-y-2'
                          : 'opacity-100 translate-y-0'
                      }`}
                    >
                      {!submitted && 'Send Message'}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </FadeIn>

          {/* ── RIGHT: Editorial photo area with contact info overlay ── */}
          <FadeIn delay={0.15} className="relative">
            <div
              className="relative h-full min-h-[600px] lg:min-h-0 overflow-hidden bg-burgundy-deep"
            >
              {/* Background editorial image */}
              <div className="absolute inset-0">
                <div className="absolute inset-0">
                  <Image
                    src="/images/contact-editorial.jpg"
                    alt="Contact editorial"
                    fill
                    className="object-cover"
                    style={{ opacity: 0.25 }}
                  />
                </div>
                {/* Gradient overlay for legibility */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(160deg, rgba(61,10,14,0.92) 0%, rgba(74,26,32,0.85) 50%, rgba(91,14,20,0.78) 100%)',
                  }}
                />
              </div>

              {/* Decorative gold thread line */}
              <div
                ref={goldThreadRef}
                className="absolute top-0 right-12 w-px h-full origin-top bg-gold"
                style={{ opacity: 0.12, transform: 'scaleY(0)' }}
              />

              {/* Contact info overlay */}
              <div className="relative z-10 h-full flex flex-col justify-between p-8 sm:p-12 lg:p-14">
                <div>
                  <FadeIn delay={0.3}>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.25em] mb-1 text-gold"
                    >
                      Contact Details
                    </p>
                  </FadeIn>
                  <h2
                    className="text-2xl sm:text-3xl font-heading mb-12 text-gold-pale"
                  >
                    Find us here
                  </h2>
                </div>

                <div className="space-y-8 flex-1">
                  <InfoBlock heading="Visit Us" delay={0.1}>
                    <p>
                      {config.address.street}<br />
                      {config.address.city}, {config.address.state} {config.address.zip}<br />
                      {config.address.country}
                    </p>
                  </InfoBlock>

                  <InfoBlock heading="Contact" delay={0.2}>
                    <p>
                      <a
                        href={`mailto:${config.email}`}
                        className="transition-colors duration-300 hover:underline underline-offset-4 text-gold-pale hover:text-gold"
                      >
                        {config.email}
                      </a>
                    </p>
                    <p className="mt-1">{config.phone}</p>
                  </InfoBlock>

                  <InfoBlock heading="Hours" delay={0.3}>
                    <p>
                      Monday &ndash; Friday: 10am &ndash; 7pm<br />
                      Saturday: 11am &ndash; 6pm<br />
                      Sunday: 12pm &ndash; 5pm
                    </p>
                  </InfoBlock>

                  <InfoBlock heading="Follow Us" delay={0.4}>
                    <div className="flex flex-wrap gap-5 mt-1">
                      {Object.entries(config.social).map(([platform, url]) => (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm capitalize transition-colors duration-300 text-parchment hover:text-gold"
                        >
                          {platform}
                        </a>
                      ))}
                    </div>
                  </InfoBlock>
                </div>

                {/* Bottom decorative element */}
                <div
                  ref={bottomDecoRef}
                  className="mt-12 pt-8 border-t flex items-center gap-3 opacity-0"
                  style={{ borderColor: 'rgba(241,225,148,0.12)' }}
                >
                  <div
                    className="w-2 h-2 rounded-full bg-gold"
                  />
                  <p
                    className="text-xs tracking-widest uppercase text-gold-muted"
                    style={{ opacity: 0.7 }}
                  >
                    Snug&amp;Knot &mdash; New York
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  )
}
