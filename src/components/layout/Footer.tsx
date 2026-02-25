'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getSiteConfig } from '@/lib/data'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

/* ─────────────────────────────────────────────
   SOCIAL ICONS
   ───────────────────────────────────────────── */
const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  pinterest: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.425 1.808-2.425.853 0 1.265.64 1.265 1.408 0 .858-.546 2.14-.828 3.33-.236.995.499 1.806 1.481 1.806 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.134-4.515 4.34 0 .859.331 1.781.745 2.282a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.222-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
    </svg>
  ),
  tiktok: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-.81-.07l-.38-.03z" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
}

/* ─────────────────────────────────────────────
   FOOTER LINK DATA
   ───────────────────────────────────────────── */
const footerLinks = {
  shop: [
    { href: '/shop/men', label: 'Men' },
    { href: '/shop/women', label: 'Women' },
    { href: '/shop/kids', label: 'Kids' },
  ],
  company: [
    { href: '/about', label: 'The Full Thread' },
    { href: '/contact', label: 'The Other End' },
  ],
  help: [
    { href: '/shipping-returns', label: 'Shipping & Returns' },
    { href: '/care-instructions', label: 'Care Instructions' },
    { href: '/faq', label: 'FAQ' },
  ],
}

/* ─────────────────────────────────────────────
   ROLLING TEXT LINK — Hover flip effect
   ───────────────────────────────────────────── */
function RollingLink({ href, label }: { href: string; label: string }) {
  const isInternal = href.startsWith('/')
  const cls =
    'group/roll relative block overflow-hidden text-sm text-gold-pale/60 leading-snug py-0.5'

  const inner = (
    <>
      <span className="block transition-transform duration-500 ease-[var(--ease-yarn-pull)] group-hover/roll:-translate-y-full">
        {label}
      </span>
      <span
        aria-hidden="true"
        className="absolute top-0.5 left-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-yarn-pull)] group-hover/roll:translate-y-0 text-gold"
      >
        {label}
      </span>
    </>
  )

  if (isInternal) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    )
  }

  const isExternal = href.startsWith('http')
  return (
    <a
      href={href}
      className={cls}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {inner}
    </a>
  )
}

/* ─────────────────────────────────────────────
   MAGNETIC SOCIAL ICON — Follows cursor on hover
   ───────────────────────────────────────────── */
function MagneticIcon({
  href,
  platform,
  children,
}: {
  href: string
  platform: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    gsap.to(el, { x: x * 0.35, y: y * 0.35, duration: 0.3, ease: 'power2.out' })
  }, [])

  const handleMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' })
  }, [])

  return (
    <a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-11 h-11 rounded-full border border-gold-pale/15 flex items-center justify-center text-gold-pale/50 hover:text-gold hover:border-gold/40 hover:bg-gold/5 transition-colors duration-300"
      aria-label={platform}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </a>
  )
}

/* ─────────────────────────────────────────────
   MAIN FOOTER
   ───────────────────────────────────────────── */
export default function Footer() {
  const config = getSiteConfig()
  const reducedMotion = useReducedMotion()

  /* refs */
  const footerRef = useRef<HTMLElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const bigTextRef = useRef<HTMLDivElement>(null)
  const threadPath1Ref = useRef<SVGPathElement>(null)
  const threadPath2Ref = useRef<SVGPathElement>(null)
  const dividerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const easterEggRef = useRef<HTMLDivElement>(null)

  /* newsletter state */
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setTimeout(() => setSubscribed(false), 3000)
      setEmail('')
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /* ─── GSAP Animations ─── */
  useEffect(() => {
    if (reducedMotion) return

    const footer = footerRef.current
    const marquee = marqueeRef.current
    const bigText = bigTextRef.current
    const threadPath1 = threadPath1Ref.current
    const threadPath2 = threadPath2Ref.current
    const divider = dividerRef.current
    const content = contentRef.current
    const bottom = bottomRef.current
    const easterEgg = easterEggRef.current

    if (!footer || !bigText || !content || !bottom) return

    const ctx = gsap.context(() => {
      /* ── Thread SVG paths: draw on scroll ── */
      ;[threadPath1, threadPath2].forEach((path) => {
        if (!path) return
        const length = path.getTotalLength()
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: footer,
            start: 'top 100%',
            end: 'bottom 40%',
            scrub: 1.2,
          },
        })
      })

      /* ── Marquee fade-in ── */
      if (marquee) {
        gsap.set(marquee, { opacity: 0, y: 10 })
        gsap.to(marquee, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 95%',
            end: 'top 75%',
            scrub: 0.5,
          },
        })
      }

      /* ── Big brand text: 3D character reveal ── */
      const chars = bigText.querySelectorAll('.footer-char')
      gsap.set(chars, {
        opacity: 0,
        y: 100,
        rotateX: -90,
        scale: 0.8,
        transformOrigin: 'bottom center',
      })
      gsap.to(chars, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        duration: 1.2,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: bigText,
          start: 'top 90%',
          end: 'top 55%',
          scrub: 0.6,
        },
      })

      /* ── Tagline fade-in ── */
      const tagline = bigText.querySelector('.footer-tagline')
      if (tagline) {
        gsap.set(tagline, { opacity: 0, y: 20, letterSpacing: '0.6em' })
        gsap.to(tagline, {
          opacity: 1,
          y: 0,
          letterSpacing: '0.2em',
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: bigText,
            start: 'top 70%',
            end: 'top 45%',
            scrub: 0.5,
          },
        })
      }

      /* ── Big text parallax float ── */
      gsap.to(bigText, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: footer,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })

      /* ── Gold divider sweep ── */
      if (divider) {
        gsap.set(divider, { scaleX: 0, transformOrigin: 'left center' })
        gsap.to(divider, {
          scaleX: 1,
          duration: 1.4,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: divider,
            start: 'top 88%',
            end: 'top 60%',
            scrub: 0.5,
          },
        })
      }

      /* ── Content columns stagger up ── */
      const cols = content.querySelectorAll('.footer-col')
      gsap.set(cols, { opacity: 0, y: 50 })
      gsap.to(cols, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: content,
          start: 'top 88%',
          end: 'top 55%',
          scrub: 0.5,
        },
      })

      /* ── Bottom bar ── */
      gsap.set(bottom, { opacity: 0, y: 20 })
      gsap.to(bottom, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: bottom,
          start: 'top 98%',
          end: 'top 80%',
          scrub: 0.4,
        },
      })

      /* ── Easter egg ── */
      if (easterEgg) {
        gsap.set(easterEgg, { opacity: 0 })
        gsap.to(easterEgg, {
          opacity: 1,
          duration: 0.5,
          scrollTrigger: {
            trigger: easterEgg,
            start: 'top 98%',
            end: 'top 85%',
            scrub: 0.4,
          },
        })
      }
    }, footer)

    return () => ctx.revert()
  }, [reducedMotion])

  /* ─── Brand text characters ─── */
  const brandChars = ['S', 'N', 'U', 'G', '&', 'K', 'N', 'O', 'T']
  const brandValues = config.brandValues

  return (
    <footer
      ref={footerRef}
      className="relative bg-noir overflow-hidden"
      role="contentinfo"
    >
      {/* ═══ Background Layers ═══ */}

      {/* Subtle knit-dot texture */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'radial-gradient(circle, #D4A843 0.8px, transparent 0.8px)',
          backgroundSize: '20px 20px',
        }}
        aria-hidden="true"
      />

      {/* Noise grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      {/* Radial glow behind brand text */}
      <div
        className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(91,14,20,0.15) 0%, rgba(212,168,67,0.05) 40%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      {/* ═══ Animated Thread SVG Paths ═══ */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ft-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#D4A843" stopOpacity="0" />
            <stop offset="15%" stopColor="#D4A843" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#F1E194" stopOpacity="0.7" />
            <stop offset="85%" stopColor="#D4A843" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#D4A843" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ft-grad-2" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#5B0E14" stopOpacity="0" />
            <stop offset="20%" stopColor="#5B0E14" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#7A1B22" stopOpacity="0.4" />
            <stop offset="80%" stopColor="#5B0E14" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#5B0E14" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Golden thread — flows left to right */}
        <path
          ref={threadPath1Ref}
          d="M-20,120 C180,60 320,220 520,160 S740,280 960,190 S1180,60 1320,200 S1460,160 1460,160"
          fill="none"
          stroke="url(#ft-grad-1)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Burgundy thread — flows right to left */}
        <path
          ref={threadPath2Ref}
          d="M1460,300 C1260,360 1140,200 940,260 S720,140 500,230 S280,360 120,220 S-20,260 -20,260"
          fill="none"
          stroke="url(#ft-grad-2)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>

      {/* ═══ Dual Marquee — Brand Values ═══ */}
      <div ref={marqueeRef} className="relative z-10 border-b border-gold-pale/[0.06] overflow-hidden">
        {/* Forward row */}
        <div className="py-4 overflow-hidden">
          <div
            className="flex animate-marquee whitespace-nowrap"
            style={{ '--marquee-duration': '60s' } as React.CSSProperties}
          >
            {[...brandValues, ...brandValues].map((value, i) => (
              <span key={i} className="flex items-center shrink-0">
                <span className="mx-6 text-[11px] font-mono text-gold-pale/20 uppercase tracking-[0.25em]">
                  {value}
                </span>
                <span className="text-gold/25 text-[8px]">&loz;</span>
              </span>
            ))}
          </div>
        </div>
        {/* Reverse row */}
        <div className="py-4 overflow-hidden border-t border-gold-pale/[0.04]">
          <div
            className="flex animate-marquee-reverse whitespace-nowrap"
            style={{ '--marquee-duration': '55s' } as React.CSSProperties}
          >
            {[...brandValues, ...brandValues].map((value, i) => (
              <span key={i} className="flex items-center shrink-0">
                <span className="mx-6 text-[11px] font-mono text-gold-pale/15 uppercase tracking-[0.25em]">
                  {value}
                </span>
                <span className="text-burgundy-light/30 text-[8px]">&loz;</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Giant Brand Text — 3D Character Reveal ═══ */}
      <div
        ref={bigTextRef}
        className="relative z-10 pt-20 pb-16 lg:pt-28 lg:pb-20 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto"
      >
        <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4" style={{ perspective: '1000px' }}>
          {brandChars.map((char, i) => (
            <span
              key={i}
              className="footer-char inline-block text-[clamp(3.5rem,13vw,11rem)] font-heading font-bold leading-none select-none"
              style={{
                background:
                  char === '&'
                    ? 'linear-gradient(135deg, #D4A843 0%, #F1E194 50%, #D4A843 100%)'
                    : 'linear-gradient(180deg, #FAF0C8 0%, #D4C47D 60%, #BFA88E 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: 'none',
                willChange: 'transform, opacity',
              }}
            >
              {char}
            </span>
          ))}
        </div>
        <p className="footer-tagline text-center text-gold-pale/35 text-sm mt-6 font-mono tracking-[0.2em] uppercase">
          {config.tagline}
        </p>
      </div>

      {/* ═══ Gold Divider ═══ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={dividerRef}
          className="h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent"
        />
      </div>

      {/* ═══ Main Content Grid ═══ */}
      <div
        ref={contentRef}
        className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* The Loom — Shop links */}
          <div className="footer-col">
            <h3 className="text-[11px] font-semibold text-gold/50 uppercase tracking-[0.3em] mb-6">
              The Loom
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <RollingLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </div>

          {/* The Weave — Company + Contact */}
          <div className="footer-col">
            <h3 className="text-[11px] font-semibold text-gold/50 uppercase tracking-[0.3em] mb-6">
              The Weave
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <RollingLink href={link.href} label={link.label} />
                </li>
              ))}
              <li>
                <RollingLink
                  href="mailto:hello@snugandknot.com"
                  label="hello@snugandknot.com"
                />
              </li>
              <li>
                <RollingLink
                  href="tel:+919355704093"
                  label="+91-9355704093"
                />
              </li>
            </ul>
          </div>

          {/* Untangle — Help links */}
          <div className="footer-col">
            <h3 className="text-[11px] font-semibold text-gold/50 uppercase tracking-[0.3em] mb-6">
              Untangle
            </h3>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.label}>
                  <RollingLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </div>

          {/* Stay Woven — Newsletter */}
          <div className="footer-col">
            <h3 className="text-[11px] font-semibold text-gold/50 uppercase tracking-[0.3em] mb-6">
              Stay Woven
            </h3>
            <p className="text-sm text-gold-pale/35 mb-6 leading-relaxed">
              Join the thread. Receive stories, drops & quiet updates.
            </p>
            <form onSubmit={handleSubscribe} className="relative group/form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-transparent border-b border-gold-pale/15 pb-3 pt-1 text-sm text-gold-pale/70 placeholder:text-gold-pale/20 focus:outline-none focus:border-gold/40 transition-colors duration-500 pr-8"
                required
              />
              {/* Animated underline on focus */}
              <span className="absolute bottom-0 left-0 h-px w-0 bg-gold/50 group-focus-within/form:w-full transition-all duration-700 ease-[var(--ease-yarn-pull)]" />
              <button
                type="submit"
                className="absolute right-0 bottom-3 text-gold-pale/25 hover:text-gold transition-colors duration-300"
                aria-label="Subscribe"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="w-4 h-4"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              {subscribed && (
                <p className="absolute -bottom-7 left-0 text-xs text-success-moss font-mono tracking-wider animate-fade-in-up">
                  Woven in.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* ═══ Bottom Divider ═══ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-gold-pale/[0.08] to-transparent" />
      </div>

      {/* ═══ Bottom Bar ═══ */}
      <div
        ref={bottomRef}
        className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Social icons */}
          <div className="flex gap-3 order-2 lg:order-1">
            {Object.entries(config.social).map(([platform, url]) => (
              <MagneticIcon key={platform} href={url} platform={platform}>
                {SOCIAL_ICONS[platform] ?? platform.slice(0, 2)}
              </MagneticIcon>
            ))}
          </div>

          {/* Copyright + Legal */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs text-gold-pale/20 order-1 lg:order-2">
            <span>
              &copy; {new Date().getFullYear()} Snug&Knot. All rights reserved.
            </span>
            <div className="flex gap-5">
              <Link
                href="/privacy-policy"
                className="hover:text-gold-pale/45 transition-colors duration-300"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="hover:text-gold-pale/45 transition-colors duration-300"
              >
                Terms of Service
              </Link>
            </div>
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="group/top w-10 h-10 rounded-full border border-gold-pale/10 flex items-center justify-center text-gold-pale/25 hover:text-gold hover:border-gold/30 hover:bg-gold/5 transition-all duration-500 order-3"
            aria-label="Back to top"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="w-4 h-4 transition-transform duration-500 group-hover/top:-translate-y-0.5"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ═══ Easter Egg ═══ */}
      <div
        ref={easterEggRef}
        className="relative z-10 pb-10 text-center cursor-default group/egg"
      >
        <p className="text-[10px] text-gold-pale/[0.12] font-mono tracking-[0.3em] uppercase transition-all duration-700 group-hover/egg:text-gold-pale/30 group-hover/egg:tracking-[0.4em]">
          This page took 2,847 threads to weave.
        </p>
        <div className="max-h-0 overflow-hidden group-hover/egg:max-h-12 transition-all duration-700 ease-out">
          <p className="text-[10px] text-gold-pale/[0.1] font-mono tracking-[0.2em] mt-2">
            2,847 threads. 1 knot. This page.
          </p>
        </div>
      </div>
    </footer>
  )
}
