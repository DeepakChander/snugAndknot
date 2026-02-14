'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { useScrollDirection } from '@/hooks/use-scroll-direction'

const navLinks = [
  { href: '/shop/men', label: 'Men' },
  { href: '/shop/women', label: 'Women' },
  { href: '/shop/kids', label: 'Kids' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const megaMenuLinks = [
  {
    title: 'Men',
    links: [
      { href: '/shop/men', label: 'All Men' },
      { href: '/shop/men?cat=tops', label: 'Tops' },
      { href: '/shop/men?cat=bottoms', label: 'Bottoms' },
      { href: '/shop/men?cat=outerwear', label: 'Outerwear' },
      { href: '/shop/men?cat=shoes', label: 'Shoes' },
    ],
  },
  {
    title: 'Women',
    links: [
      { href: '/shop/women', label: 'All Women' },
      { href: '/shop/women?cat=tops', label: 'Tops' },
      { href: '/shop/women?cat=dresses', label: 'Dresses' },
      { href: '/shop/women?cat=outerwear', label: 'Outerwear' },
      { href: '/shop/women?cat=shoes', label: 'Shoes' },
    ],
  },
  {
    title: 'Kids',
    links: [
      { href: '/shop/kids', label: 'All Kids' },
      { href: '/shop/kids?cat=tops', label: 'Tops' },
      { href: '/shop/kids?cat=bottoms', label: 'Bottoms' },
      { href: '/shop/kids?cat=outerwear', label: 'Outerwear' },
    ],
  },
]

export default function Header() {
  const { direction, scrollY } = useScrollDirection()
  const totalItems = useCartStore((s) => s.totalItems)
  const openCart = useCartStore((s) => s.openCart)
  const { isMenuOpen, toggleMenu, closeMenu, openSearch } = useUIStore()
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isScrolled = scrollY > 50
  const isHidden = direction === 'down' && scrollY > 300 && !isMenuOpen

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isHidden ? '-translate-y-full' : 'translate-y-0'
        } ${isScrolled ? 'bg-cream/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu toggle */}
            <button
              onClick={toggleMenu}
              className="lg:hidden flex flex-col gap-1.5 w-8 p-1"
              aria-label="Toggle menu"
            >
              <span className={`block h-[1.5px] bg-charcoal transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
              <span className={`block h-[1.5px] bg-charcoal transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-[1.5px] bg-charcoal transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-8">
              <div
                className="relative"
                onMouseEnter={() => setShowMegaMenu(true)}
                onMouseLeave={() => setShowMegaMenu(false)}
              >
                <Link href="/shop" className="text-sm font-medium text-walnut hover:text-charcoal transition-colors">
                  Shop
                </Link>
              </div>
              <Link href="/collections/winter-warmth" className="text-sm font-medium text-walnut hover:text-charcoal transition-colors">
                Collections
              </Link>
              <Link href="/lookbook" className="text-sm font-medium text-walnut hover:text-charcoal transition-colors">
                Lookbook
              </Link>
            </nav>

            {/* Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0" onClick={closeMenu}>
              <span className="font-heading text-2xl lg:text-3xl text-charcoal tracking-tight">
                Snug<span className="text-terracotta">&</span>Knot
              </span>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={openSearch}
                className="p-2 text-walnut hover:text-charcoal transition-colors"
                aria-label="Search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </button>

              <Link href="/about" className="hidden lg:block text-sm font-medium text-walnut hover:text-charcoal transition-colors">
                About
              </Link>

              <button
                onClick={openCart}
                className="relative p-2 text-walnut hover:text-charcoal transition-colors"
                aria-label="Cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {mounted && totalItems() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-terracotta text-cream text-[10px] font-bold rounded-full flex items-center justify-center">
                    {totalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mega Menu */}
        <AnimatePresence>
          {showMegaMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block absolute top-full left-0 right-0 bg-cream border-t border-beige shadow-lg"
              onMouseEnter={() => setShowMegaMenu(true)}
              onMouseLeave={() => setShowMegaMenu(false)}
            >
              <div className="max-w-[1440px] mx-auto px-8 py-10 grid grid-cols-4 gap-8">
                {megaMenuLinks.map((group) => (
                  <div key={group.title}>
                    <h3 className="text-xs font-semibold text-earth uppercase tracking-widest mb-4">
                      {group.title}
                    </h3>
                    <ul className="space-y-3">
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="text-sm text-walnut hover:text-charcoal transition-colors"
                            onClick={() => setShowMegaMenu(false)}
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="bg-cream-dark rounded-lg p-6">
                  <p className="text-xs font-semibold text-earth uppercase tracking-widest mb-2">New Season</p>
                  <p className="font-heading text-xl text-charcoal mb-2">The Winter Edit</p>
                  <p className="text-sm text-walnut mb-4">Discover our curated selection for the coldest months.</p>
                  <Link
                    href="/collections/winter-warmth"
                    className="text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors"
                    onClick={() => setShowMegaMenu(false)}
                  >
                    Shop Now &rarr;
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-cream"
          >
            <div className="pt-24 px-6">
              <nav className="space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className="block py-3 text-3xl font-heading text-charcoal border-b border-beige"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + navLinks.length * 0.05, duration: 0.4 }}
                >
                  <Link href="/lookbook" onClick={closeMenu} className="block py-3 text-3xl font-heading text-charcoal border-b border-beige">
                    Lookbook
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + navLinks.length * 0.05, duration: 0.4 }}
                >
                  <Link href="/about" onClick={closeMenu} className="block py-3 text-3xl font-heading text-charcoal border-b border-beige">
                    About
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + navLinks.length * 0.05, duration: 0.4 }}
                >
                  <Link href="/contact" onClick={closeMenu} className="block py-3 text-3xl font-heading text-charcoal border-b border-beige">
                    Contact
                  </Link>
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
