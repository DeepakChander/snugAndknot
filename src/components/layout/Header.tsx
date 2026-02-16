'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { useScrollDirection } from '@/hooks/use-scroll-direction'

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/collections/winter-warmth', label: 'Collections' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/about', label: 'About' },
]

const mobileNavLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/shop/men', label: 'Men' },
  { href: '/shop/women', label: 'Women' },
  { href: '/shop/kids', label: 'Kids' },
  { href: '/collections/winter-warmth', label: 'Collections' },
  { href: '/lookbook', label: 'Lookbook' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Header() {
  const pathname = usePathname()
  const { scrollY } = useScrollDirection()
  const totalItems = useCartStore((s) => s.totalItems)
  const openCart = useCartStore((s) => s.openCart)
  const { isMenuOpen, toggleMenu, closeMenu, openSearch } = useUIStore()
  const [mounted, setMounted] = useState(false)
  const [prevCount, setPrevCount] = useState(0)
  const [cartPulse, setCartPulse] = useState(false)
  const mobileMenuCloseRef = useRef<HTMLButtonElement>(null)

  useEffect(() => setMounted(true), [])

  // Cart badge pulse animation on count change
  useEffect(() => {
    if (!mounted) return
    const count = totalItems()
    if (count !== prevCount && count > 0) {
      setCartPulse(true)
      const timer = setTimeout(() => setCartPulse(false), 400)
      setPrevCount(count)
      return () => clearTimeout(timer)
    }
    setPrevCount(count)
  }, [mounted, totalItems, prevCount])

  // Close mobile menu on route change
  useEffect(() => {
    closeMenu()
  }, [pathname, closeMenu])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  // Focus close button and handle Escape key when mobile menu opens
  useEffect(() => {
    if (!isMenuOpen) return

    // Focus the close button when menu opens
    mobileMenuCloseRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen, closeMenu])

  const isScrolled = scrollY > 10

  return (
    <>
      {/* ==========================================
          HORIZONTAL TOP APP BAR
          ========================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300`}
        style={{
          backgroundColor: isScrolled ? 'rgba(253, 248, 236, 0.95)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(24px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(24px)' : 'none',
          borderBottom: isScrolled ? '1px solid rgba(91, 14, 20, 0.06)' : '1px solid transparent',
        }}
        aria-label="Main navigation"
      >
        <nav className="mx-auto flex items-center justify-between h-16 lg:h-[72px] px-5 lg:px-10 max-w-[1920px]">

          {/* ---- LEFT: Brand Wordmark ---- */}
          <Link
            href="/"
            className="flex-shrink-0 font-heading text-xl lg:text-2xl tracking-tight select-none"
            onClick={closeMenu}
          >
            <span className="text-burgundy">Snug</span>
            <span className="text-gold">&</span>
            <span className="text-burgundy">Knot</span>
          </Link>

          {/* ---- CENTER: Desktop Nav Links ---- */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative text-sm uppercase tracking-wider font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-gold'
                      : 'text-burgundy hover:text-gold'
                  }`}
                >
                  {link.label}
                  {/* Gold underline: scaleX 0 -> 1 on hover from left */}
                  <span
                    className={`absolute left-0 -bottom-1 w-full h-[1.5px] bg-gold origin-left transition-transform duration-300 ease-out ${
                      isActive
                        ? 'scale-x-100'
                        : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              )
            })}
          </div>

          {/* ---- RIGHT: Actions ---- */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Search Icon */}
            <button
              onClick={openSearch}
              className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-full transition-colors duration-200 text-burgundy hover:bg-burgundy/5"
              aria-label="Search"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-[18px] h-[18px] lg:w-5 lg:h-5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Cart Icon with Badge */}
            <button
              onClick={openCart}
              className="relative w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-full transition-colors duration-200 text-burgundy hover:bg-burgundy/5"
              aria-label="Cart"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-[18px] h-[18px] lg:w-5 lg:h-5"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {mounted && totalItems() > 0 && (
                <span
                  className={`absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gold text-burgundy text-[10px] font-bold rounded-full flex items-center justify-center transition-transform duration-200 ${
                    cartPulse ? 'scale-125' : 'scale-100'
                  }`}
                >
                  {totalItems()}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={toggleMenu}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-burgundy/5"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              <div className="w-5 h-5 relative flex flex-col items-center justify-center">
                <span
                  className="block absolute w-5 h-[1.5px] bg-burgundy transition-all duration-300"
                  style={{
                    transform: isMenuOpen ? 'rotate(45deg)' : 'translateY(-4px)',
                  }}
                />
                <span
                  className="block absolute w-5 h-[1.5px] bg-burgundy transition-all duration-300"
                  style={{
                    opacity: isMenuOpen ? 0 : 1,
                  }}
                />
                <span
                  className="block absolute w-5 h-[1.5px] bg-burgundy transition-all duration-300"
                  style={{
                    transform: isMenuOpen ? 'rotate(-45deg)' : 'translateY(4px)',
                  }}
                />
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* ==========================================
          MOBILE: Full-Screen Menu Overlay
          ========================================== */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-noir overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.22,0.68,0.36,1)] ${
          isMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Close button at top right */}
        <div className="flex justify-end p-5">
          <button
            ref={mobileMenuCloseRef}
            onClick={closeMenu}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-6 h-6 text-gold-pale"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="px-8 pb-24">
          <nav className="space-y-0">
            {mobileNavLinks.map((link, i) => (
              <div
                key={link.href}
                className={`transition-all duration-500 ease-[cubic-bezier(0.22,0.68,0.36,1)] ${
                  isMenuOpen
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-10'
                }`}
                style={{
                  transitionDelay: isMenuOpen ? `${50 + i * 60}ms` : '0ms',
                }}
              >
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className="block py-3 font-heading text-gold-pale hover:text-gold transition-colors border-b border-gold/5"
                  style={{ fontSize: 'clamp(1.5rem, 4vw, 3rem)' }}
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Mobile menu actions */}
          <div
            className={`mt-10 flex gap-4 transition-opacity duration-500 ${
              isMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: isMenuOpen ? '500ms' : '0ms' }}
          >
            <button
              onClick={() => {
                closeMenu()
                openSearch()
              }}
              className="flex items-center gap-2 text-gold-pale/60 hover:text-gold transition-colors text-sm"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-4 h-4"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Search
            </button>
            <button
              onClick={() => {
                closeMenu()
                openCart()
              }}
              className="flex items-center gap-2 text-gold-pale/60 hover:text-gold transition-colors text-sm"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-4 h-4"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Cart
              {mounted && totalItems() > 0 && (
                <span className="ml-1 min-w-[18px] h-[18px] px-1 bg-gold text-burgundy text-[10px] font-bold rounded-full inline-flex items-center justify-center">
                  {totalItems()}
                </span>
              )}
            </button>
          </div>

          {/* Brand info at bottom of mobile menu */}
          <div
            className={`mt-12 text-gold-pale/40 text-sm transition-opacity duration-500 ${
              isMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ transitionDelay: isMenuOpen ? '600ms' : '0ms' }}
          >
            <p className="font-heading text-gold-pale/60 text-lg mb-2">
              Snug<span className="text-gold">&</span>Knot
            </p>
            <p>Where tension becomes tenderness.</p>
          </div>
        </div>
      </div>
    </>
  )
}
