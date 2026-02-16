'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getSiteConfig } from '@/lib/data'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

gsap.registerPlugin(ScrollTrigger)

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

/**
 * Thread line configuration for the "Unraveling" approach animation.
 * 4-6 horizontal lines that emerge from the bottom edge as the user
 * scrolls toward the footer.
 */
const THREAD_LINES = [
  { color: 'rgba(91, 14, 20, 0.30)', height: 1, offsetX: 0 },
  { color: 'rgba(241, 225, 148, 0.15)', height: 2, offsetX: 12 },
  { color: 'rgba(91, 14, 20, 0.30)', height: 1, offsetX: -8 },
  { color: 'rgba(241, 225, 148, 0.15)', height: 1, offsetX: 20 },
  { color: 'rgba(91, 14, 20, 0.30)', height: 2, offsetX: -16 },
  { color: 'rgba(241, 225, 148, 0.15)', height: 1, offsetX: 6 },
]

export default function Footer() {
  const config = getSiteConfig()
  const reducedMotion = useReducedMotion()

  const footerRef = useRef<HTMLElement>(null)
  const threadsContainerRef = useRef<HTMLDivElement>(null)
  const contentRowsRef = useRef<HTMLDivElement>(null)
  const bottomBarRef = useRef<HTMLDivElement>(null)
  const easterEggRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reducedMotion) return

    const footer = footerRef.current
    const threadsContainer = threadsContainerRef.current
    const contentRows = contentRowsRef.current
    const bottomBar = bottomBarRef.current
    const easterEgg = easterEggRef.current

    if (!footer || !threadsContainer || !contentRows || !bottomBar || !easterEgg) return

    const ctx = gsap.context(() => {
      // ─── Phase 1: Thread lines emerge as user approaches ───
      const threadEls = threadsContainer.querySelectorAll('.unravel-thread')

      // Initially hide threads
      gsap.set(threadEls, {
        scaleX: 0,
        opacity: 0,
        transformOrigin: 'center center',
      })

      // Approach animation: threads emerge before footer is in view
      gsap.to(threadEls, {
        scaleX: 1,
        opacity: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 120%',   // Start before footer enters viewport
          end: 'top 90%',
          scrub: 0.6,
        },
      })

      // ─── Phase 2: Content rows stagger in ───
      const rows = contentRows.querySelectorAll('.footer-row')

      gsap.set(rows, {
        opacity: 0,
        y: 32,
      })

      gsap.to(rows, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 85%',
          end: 'top 50%',
          scrub: 0.4,
        },
      })

      // ─── Phase 2b: Bottom bar fades in ───
      gsap.set(bottomBar, { opacity: 0, y: 20 })
      gsap.to(bottomBar, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 60%',
          end: 'top 35%',
          scrub: 0.4,
        },
      })

      // ─── Phase 2c: Easter egg fades in ───
      gsap.set(easterEgg, { opacity: 0, y: 12 })
      gsap.to(easterEgg, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 45%',
          end: 'top 25%',
          scrub: 0.4,
        },
      })

      // ─── Phase 3: Threads settle and weave with content ───
      // Once fully visible, threads pulse subtly
      gsap.to(threadEls, {
        opacity: (i: number) => (i % 2 === 0 ? 0.25 : 0.12),
        duration: 2,
        stagger: 0.3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        scrollTrigger: {
          trigger: footer,
          start: 'top 40%',
          toggleActions: 'play pause resume pause',
        },
      })
    }, footer)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <footer
      ref={footerRef}
      className="relative bg-noir text-gold-pale/80 overflow-hidden"
    >
      {/* ═══ Unraveling Thread Lines ═══ */}
      <div
        ref={threadsContainerRef}
        className="absolute inset-0 pointer-events-none z-0"
        aria-hidden="true"
      >
        {THREAD_LINES.map((thread, i) => (
          <div
            key={i}
            className="unravel-thread absolute w-full"
            style={{
              backgroundColor: thread.color,
              height: `${thread.height}px`,
              top: `${14 + i * 16}%`,
              left: `${thread.offsetX}px`,
            }}
          />
        ))}
      </div>

      {/* ═══ Footer Content ═══ */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div ref={contentRowsRef}>
          {/* Top section — 4-column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
            {/* Brand */}
            <div className="footer-row lg:col-span-1">
              <Link href="/" className="inline-block mb-4">
                <span className="font-heading text-3xl">
                  <span className="text-gold-pale">Snug</span>
                  <span className="text-gold">&</span>
                  <span className="text-gold-pale">Knot</span>
                </span>
              </Link>
              <p className="text-sm text-gold-pale/60 leading-relaxed mb-6 max-w-xs">
                {config.tagline}
              </p>
              <div className="flex gap-4">
                {Object.entries(config.social).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-gold-pale/20 flex items-center justify-center text-gold-pale/60 hover:text-gold hover:border-gold/40 transition-colors duration-300"
                    aria-label={platform}
                  >
                    {SOCIAL_ICONS[platform] ?? platform.slice(0, 2)}
                  </a>
                ))}
              </div>
            </div>

            {/* Shop links */}
            <div className="footer-row">
              <h3 className="text-xs font-semibold text-gold-pale/40 uppercase tracking-[0.2em] mb-5">
                The Loom
              </h3>
              <ul className="space-y-3">
                {footerLinks.shop.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gold-pale/60 hover:text-gold transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div className="footer-row">
              <h3 className="text-xs font-semibold text-gold-pale/40 uppercase tracking-[0.2em] mb-5">
                The Weave
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gold-pale/60 hover:text-gold transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help links */}
            <div className="footer-row">
              <h3 className="text-xs font-semibold text-gold-pale/40 uppercase tracking-[0.2em] mb-5">
                Untangle
              </h3>
              <ul className="space-y-3">
                {footerLinks.help.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gold-pale/60 hover:text-gold transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ═══ Bottom Bar ═══ */}
        <div
          ref={bottomBarRef}
          className="pt-8 border-t border-gold-pale/10 flex flex-col sm:flex-row justify-between items-center gap-4"
        >
          <p className="text-xs text-gold-pale/30">
            &copy; {new Date().getFullYear()} Snug&Knot. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy-policy"
              className="text-xs text-gold-pale/30 hover:text-gold-pale/60 transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-xs text-gold-pale/30 hover:text-gold-pale/60 transition-colors duration-300"
            >
              Terms of Service
            </Link>
          </div>
        </div>

        {/* ═══ The Unraveling Footer -- thread count easter egg ═══ */}
        <div
          ref={easterEggRef}
          className="mt-12 text-center group cursor-default"
        >
          <p className="text-[10px] text-gold-pale/20 font-mono tracking-[0.3em] uppercase transition-colors duration-700 group-hover:text-gold-pale/40">
            This page took 2,847 threads to weave.
          </p>
          <div className="max-h-0 overflow-hidden group-hover:max-h-16 transition-all duration-700 ease-out">
            <p className="text-[10px] text-gold-pale/20 font-mono tracking-[0.2em] mt-2 leading-relaxed">
              2,847 threads. 1 knot. This page.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
