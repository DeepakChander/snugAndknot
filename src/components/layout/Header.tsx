'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { useScrollDirection } from '@/hooks/use-scroll-direction'
import MegaMenu from './MegaMenu'

const navLinks = [
  { href: '/shop', label: 'Shop', hasMega: true },
  { href: '/collections/winter-warmth', label: 'Collections', hasMega: false },
  { href: '/lookbook', label: 'Lookbook', hasMega: false },
  { href: '/about', label: 'About', hasMega: false },
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
  const { isAuthenticated, user, openAuthModal } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [prevCount, setPrevCount] = useState(0)
  const [cartPulse, setCartPulse] = useState(false)
  const [isMegaOpen, setIsMegaOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const mobileMenuCloseRef = useRef<HTMLButtonElement>(null)
  const megaTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

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
    setIsMegaOpen(false)
    setShowUserMenu(false)
  }, [pathname, closeMenu])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      useUIStore.getState().lenisStop?.()
    } else {
      document.body.style.overflow = ''
      useUIStore.getState().lenisStart?.()
    }
    return () => {
      document.body.style.overflow = ''
      useUIStore.getState().lenisStart?.()
    }
  }, [isMenuOpen])

  // Focus close button and handle Escape key when mobile menu opens
  useEffect(() => {
    if (!isMenuOpen) return
    mobileMenuCloseRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen, closeMenu])

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleMegaEnter = () => {
    if (megaTimeoutRef.current) clearTimeout(megaTimeoutRef.current)
    setIsMegaOpen(true)
  }

  const handleMegaLeave = () => {
    megaTimeoutRef.current = setTimeout(() => setIsMegaOpen(false), 300)
  }

  const isScrolled = scrollY > 10

  return (
    <>
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
                <div
                  key={link.href}
                  onMouseEnter={link.hasMega ? handleMegaEnter : undefined}
                  onMouseLeave={link.hasMega ? handleMegaLeave : undefined}
                  className="relative"
                >
                  <Link
                    href={link.href}
                    className={`group relative text-sm uppercase tracking-wider font-medium transition-colors duration-200 ${
                      isActive
                        ? 'text-gold'
                        : 'text-burgundy hover:text-gold'
                    }`}
                    aria-expanded={link.hasMega ? isMegaOpen : undefined}
                  >
                    {link.label}
                    <span
                      className={`absolute left-0 -bottom-1 w-full h-[1.5px] bg-gold origin-left transition-transform duration-300 ease-out ${
                        isActive
                          ? 'scale-x-100'
                          : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                </div>
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
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px] lg:w-5 lg:h-5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* User Account Icon */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setShowUserMenu(!showUserMenu)
                  } else {
                    openAuthModal('login')
                  }
                }}
                className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-full transition-colors duration-200 text-burgundy hover:bg-burgundy/5"
                aria-label={isAuthenticated ? 'Account menu' : 'Sign in'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px] lg:w-5 lg:h-5">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {mounted && isAuthenticated && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-success-moss rounded-full border-2 border-ivory" />
                )}
              </button>

              {/* User Dropdown */}
              {showUserMenu && isAuthenticated && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-ivory rounded-xl shadow-xl border border-burgundy/10 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-burgundy/5">
                    <p className="text-sm font-medium text-burgundy truncate">{user?.name}</p>
                    <p className="text-xs text-dust truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    {[
                      { href: '/account', label: 'My Account' },
                      { href: '/account/orders', label: 'Orders' },
                      { href: '/account/wishlist', label: 'Wishlist' },
                      { href: '/account/rewards', label: 'Rewards' },
                      { href: '/account/returns', label: 'Returns' },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-burgundy hover:bg-parchment transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-burgundy/5 py-1">
                    <button
                      onClick={() => {
                        useAuthStore.getState().logout()
                        setShowUserMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-error-garnet hover:bg-parchment transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Icon with Badge */}
            <button
              onClick={openCart}
              className="relative w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-full transition-colors duration-200 text-burgundy hover:bg-burgundy/5"
              aria-label="Cart"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[18px] h-[18px] lg:w-5 lg:h-5">
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
                  style={{ transform: isMenuOpen ? 'rotate(45deg)' : 'translateY(-4px)' }}
                />
                <span
                  className="block absolute w-5 h-[1.5px] bg-burgundy transition-all duration-300"
                  style={{ opacity: isMenuOpen ? 0 : 1 }}
                />
                <span
                  className="block absolute w-5 h-[1.5px] bg-burgundy transition-all duration-300"
                  style={{ transform: isMenuOpen ? 'rotate(-45deg)' : 'translateY(4px)' }}
                />
              </div>
            </button>
          </div>
        </nav>

        {/* Mega Menu */}
        <div
          onMouseEnter={handleMegaEnter}
          onMouseLeave={handleMegaLeave}
        >
          <MegaMenu isOpen={isMegaOpen} onClose={() => setIsMegaOpen(false)} />
        </div>
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
        <div className="flex justify-end p-5">
          <button
            ref={mobileMenuCloseRef}
            onClick={closeMenu}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 transition-colors"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-gold-pale">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-8 pb-24">
          <nav className="space-y-0">
            {mobileNavLinks.map((link, i) => (
              <div
                key={link.href}
                className={`transition-all duration-500 ease-[cubic-bezier(0.22,0.68,0.36,1)] ${
                  isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                }`}
                style={{ transitionDelay: isMenuOpen ? `${50 + i * 60}ms` : '0ms' }}
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
            className={`mt-10 flex flex-wrap gap-4 transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
            style={{ transitionDelay: isMenuOpen ? '500ms' : '0ms' }}
          >
            <button
              onClick={() => { closeMenu(); openSearch() }}
              className="flex items-center gap-2 text-gold-pale/60 hover:text-gold transition-colors text-sm"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Search
            </button>
            <button
              onClick={() => { closeMenu(); openCart() }}
              className="flex items-center gap-2 text-gold-pale/60 hover:text-gold transition-colors text-sm"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Cart
              {mounted && totalItems() > 0 && (
                <span className="ml-1 min-w-[18px] h-[18px] px-1 bg-gold text-burgundy text-[10px] font-bold rounded-full inline-flex items-center justify-center">
                  {totalItems()}
                </span>
              )}
            </button>
            {mounted && (
              <Link
                href={isAuthenticated ? '/account' : '#'}
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault()
                    closeMenu()
                    openAuthModal('login')
                  } else {
                    closeMenu()
                  }
                }}
                className="flex items-center gap-2 text-gold-pale/60 hover:text-gold transition-colors text-sm"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                {isAuthenticated ? 'Account' : 'Sign In'}
              </Link>
            )}
          </div>

          <div
            className={`mt-12 text-gold-pale/40 text-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
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
