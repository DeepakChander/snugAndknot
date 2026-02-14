'use client'

import Link from 'next/link'
import { getSiteConfig } from '@/lib/data'

const footerLinks = {
  shop: [
    { href: '/shop/men', label: 'Men' },
    { href: '/shop/women', label: 'Women' },
    { href: '/shop/kids', label: 'Kids' },
  ],
  company: [
    { href: '/about', label: 'Our Story' },
    { href: '/contact', label: 'Contact' },
  ],
  help: [
    { href: '#', label: 'Shipping & Returns' },
    { href: '#', label: 'Size Guide' },
    { href: '#', label: 'Care Instructions' },
    { href: '#', label: 'FAQ' },
  ],
}

export default function Footer() {
  const config = getSiteConfig()

  return (
    <footer className="relative bg-charcoal text-cream/80">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="font-heading text-3xl text-cream">
                Snug<span className="text-terracotta">&</span>Knot
              </span>
            </Link>
            <p className="text-sm text-cream/60 leading-relaxed mb-6 max-w-xs">
              {config.tagline}
            </p>
            <div className="flex gap-4">
              {Object.entries(config.social).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-cream/20 flex items-center justify-center text-cream/60 hover:text-cream hover:border-cream/40 transition-colors text-xs uppercase"
                  aria-label={platform}
                >
                  {platform.slice(0, 2)}
                </a>
              ))}
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h3 className="text-xs font-semibold text-cream/40 uppercase tracking-[0.2em] mb-5">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-cream/60 hover:text-cream transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-xs font-semibold text-cream/40 uppercase tracking-[0.2em] mb-5">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-cream/60 hover:text-cream transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h3 className="text-xs font-semibold text-cream/40 uppercase tracking-[0.2em] mb-5">Help</h3>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-cream/60 hover:text-cream transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-cream/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-cream/40">
            &copy; {new Date().getFullYear()} Snug&Knot. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-cream/40 hover:text-cream/60 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-cream/40 hover:text-cream/60 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
