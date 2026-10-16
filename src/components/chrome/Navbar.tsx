'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useHydrated } from '@/hooks/use-hydrated'
import { useCurrency, useMoney, useSettings } from '@/components/providers/SettingsProvider'
import { cn } from '@/lib/format'
import { DEPARTMENT_TITLES, openDepartments, type Department } from '@/lib/categories'
import MegaMenu from './MegaMenu'
import CurrencySwitcher from './CurrencySwitcher'
import { BagIcon, HeartIcon, SearchIcon, UserIcon } from '@/components/kit/icons'

const ANNOUNCE_H = 32

const FREE_SHIPPING = '{free-shipping}'

function AnnouncementBar({ messages: raw, link, hidden }: { messages: string[]; link: string; hidden: boolean }) {
  // {free-shipping} → the free-shipping amount in the shopper's currency; a message that needs it is
  // left out while there is no free-shipping amount.
  const money = useMoney()
  const { currency } = useCurrency()
  const free = currency.freeShippingThreshold
  const messages = raw.filter((m) => !m.includes(FREE_SHIPPING) || free > 0).map((m) => m.split(FREE_SHIPPING).join(money(free)))
  const [i, setI] = useState(0)
  useEffect(() => {
    if (messages.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 5000)
    return () => clearInterval(t)
  }, [messages.length])
  if (!messages.length) return null
  const shown = messages[i % messages.length]
  return (
    <div className={cn('overflow-hidden bg-ink text-white transition-[height] duration-300', hidden ? 'h-0' : 'h-8')}>
      <Link href={link || '/shop'} className="relative flex h-8 items-center justify-center text-[0.7rem] font-medium uppercase tracking-[0.14em] text-white/90 hover:text-white">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            // A message with an amount waits, like every price, until the shopper's currency is known.
            data-money={raw[i % raw.length]?.includes(FREE_SHIPPING) ? '' : undefined}
            className="px-4 text-center"
          >
            {shown}
          </motion.span>
        </AnimatePresence>
      </Link>
    </div>
  )
}

const iconBtn = 'relative flex h-10 w-10 items-center justify-center text-ink/85 transition-colors hover:text-ink'

/**
 * The header: departments on the left (each opens its menu on hover or focus), the name in the
 * middle, search, account, wishlist and bag on the right. A plain white bar that steps out of the
 * way while scrolling down and comes back on the way up.
 */
export default function Navbar() {
  const pathname = usePathname()
  const settings = useSettings()
  const hydrated = useHydrated()
  const items = useCartStore((s) => s.items)
  const openCart = useCartStore((s) => s.openCart)
  const wishCount = useWishlistStore((s) => s.items.length)
  const user = useAuthStore((s) => s.user)
  const openAuthModal = useAuthStore((s) => s.openAuthModal)
  const { isMenuOpen, toggleMenu, closeMenu, openSearch } = useUIStore()

  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mega, setMega] = useState<Department | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const headerRef = useRef<HTMLElement>(null)

  const bagCount = hydrated ? items.reduce((s, i) => s + i.quantity, 0) : 0
  const messages = settings.announcement.messages.filter(Boolean)
  const shownMessages = messages.filter((m) => !m.includes('{free-shipping}') || settings.commerce.freeShippingThreshold > 0)
  const announcement = settings.announcement.enabled && shownMessages.length > 0

  // Hide on the way down, return on the way up.
  useEffect(() => {
    let last = window.scrollY
    let raf = 0
    const sample = () => {
      raf = 0
      const y = window.scrollY
      setScrolled(y > 24)
      const delta = y - last
      if (Math.abs(delta) > 6) {
        setHidden(delta > 0 && y > 160)
        last = y
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sample)
    }
    sample()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  useEffect(() => {
    setMega(null)
    closeMenu()
    // A new page always starts with the header visible.
    setHidden(false)
  }, [pathname, closeMenu])

  useEffect(() => {
    document.documentElement.style.setProperty('--announce-h', announcement && !scrolled ? `${ANNOUNCE_H}px` : '0px')
  }, [announcement, scrolled])

  // Sticky page elements (shop toolbar, summaries) sit under the visible header only.
  const overlayOpen = !!mega || isMenuOpen
  useEffect(() => {
    const offset = hidden && !overlayOpen ? '0px' : `calc(var(--nav-h) + ${announcement && !scrolled ? ANNOUNCE_H : 0}px)`
    document.documentElement.style.setProperty('--nav-offset', offset)
  }, [hidden, overlayOpen, announcement, scrolled])

  const openMega = useCallback((d: Department) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setMega(d)
  }, [])
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setMega(null), 150)
  }, [])

  useEffect(() => {
    if (!mega) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMega(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mega])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      <header
        ref={headerRef}
        data-chrome
        onMouseLeave={scheduleClose}
        onBlur={(e) => {
          if (!headerRef.current?.contains(e.relatedTarget as Node | null)) setMega(null)
        }}
        className={cn('fixed inset-x-0 top-0 z-[100] transition-transform duration-300 ease-out', hidden && !overlayOpen ? '-translate-y-full' : 'translate-y-0')}
      >
        {announcement ? <AnnouncementBar messages={messages} link={settings.announcement.link} hidden={scrolled} /> : null}

        <div className={cn('relative bg-white transition-shadow duration-300', (scrolled || mega) && !isMenuOpen ? 'shadow-[0_1px_0_rgba(22,21,19,0.08)]' : '')}>
          <nav aria-label="Main" className="mx-auto grid h-[var(--nav-h)] max-w-[1920px] grid-cols-[1fr_auto_1fr] items-center px-gutter">
            {/* Left: menu and search (phones), departments (desktop) */}
            <div className="flex items-center">
              <button type="button" onClick={toggleMenu} aria-expanded={isMenuOpen} aria-controls="mobile-menu" aria-label={isMenuOpen ? 'Close menu' : 'Open menu'} className={cn(iconBtn, '-ml-2.5 lg:hidden')}>
                <span className="relative flex h-3 w-5 flex-col justify-between">
                  <span className={cn('h-[1.5px] w-full origin-center bg-current transition-transform duration-300', isMenuOpen && 'translate-y-[5.25px] rotate-45')} />
                  <span className={cn('h-[1.5px] w-full bg-current transition-opacity duration-200', isMenuOpen && 'opacity-0')} />
                  <span className={cn('h-[1.5px] w-full origin-center bg-current transition-transform duration-300', isMenuOpen && '-translate-y-[5.25px] -rotate-45')} />
                </span>
              </button>
              <button type="button" onClick={openSearch} aria-label="Search" className={cn(iconBtn, 'lg:hidden')}>
                <SearchIcon size={20} />
              </button>
              <ul className="-ml-3 hidden items-center lg:flex">
                {openDepartments(settings.store).map((d) => {
                  const href = `/shop/${d}`
                  const active = isActive(href)
                  return (
                    <li key={d} onMouseEnter={() => openMega(d)}>
                      <Link
                        href={href}
                        aria-current={active ? 'page' : undefined}
                        aria-expanded={mega === d}
                        aria-controls="mega-menu"
                        onFocus={() => openMega(d)}
                        className={cn(
                          'relative flex h-[var(--nav-h)] items-center px-3 text-[0.82rem] font-medium uppercase tracking-[0.08em] text-ink/80 transition-colors hover:text-ink',
                          'after:absolute after:inset-x-3 after:bottom-[18px] after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300',
                          (active || mega === d) && 'text-ink after:scale-x-100'
                        )}
                      >
                        {DEPARTMENT_TITLES[d]}
                      </Link>
                    </li>
                  )
                })}
                <li onMouseEnter={scheduleClose}>
                  <Link
                    href="/shop?sort=newest"
                    className="flex h-[var(--nav-h)] items-center px-3 text-[0.82rem] font-medium uppercase tracking-[0.08em] text-ink/80 transition-colors hover:text-ink"
                  >
                    New in
                  </Link>
                </li>
              </ul>
            </div>

            {/* Centre: the name */}
            <Link href="/" aria-label={`${settings.store.name}, home`} onMouseEnter={scheduleClose} className="justify-self-center px-2 text-[1.05rem] font-semibold uppercase tracking-[0.22em] text-ink sm:text-[1.2rem]">
              {settings.store.name}
            </Link>

            {/* Right: currency, search, account, wishlist, bag */}
            <div className="-mr-2.5 flex items-center justify-end" onMouseEnter={scheduleClose}>
              <CurrencySwitcher className="mr-2 hidden text-ink/75 xl:inline-flex" />
              <button type="button" onClick={openSearch} aria-label="Search" className={cn(iconBtn, 'hidden lg:flex')}>
                <SearchIcon size={20} />
              </button>
              {user ? (
                <Link href="/account" aria-label="Your account" className={cn(iconBtn, 'hidden sm:flex')}>
                  <UserIcon size={20} />
                </Link>
              ) : (
                <button type="button" onClick={() => openAuthModal('login')} aria-label="Sign in" className={cn(iconBtn, 'hidden sm:flex')}>
                  <UserIcon size={20} />
                </button>
              )}
              <Link href="/account/wishlist" aria-label={`Wishlist${hydrated && wishCount ? `, ${wishCount} saved` : ''}`} className={cn(iconBtn, 'hidden sm:flex')}>
                <HeartIcon size={20} />
                {hydrated && wishCount > 0 ? <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-ink" aria-hidden /> : null}
              </Link>
              <button type="button" onClick={openCart} aria-label={`Bag, ${bagCount} item${bagCount === 1 ? '' : 's'}`} className={iconBtn}>
                <BagIcon size={20} />
                {bagCount > 0 ? (
                  <span className="absolute right-0.5 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[0.62rem] font-semibold leading-none text-white tabular-nums">{bagCount}</span>
                ) : null}
              </button>
            </div>
          </nav>
        </div>

        <MegaMenu dept={mega} onEnter={() => closeTimer.current && clearTimeout(closeTimer.current)} onLeave={scheduleClose} onNavigate={() => setMega(null)} />
      </header>

      {/* Dim the page under an open menu. */}
      <AnimatePresence>
        {mega ? (
          <motion.div
            key="mega-dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] hidden bg-ink/20 lg:block"
            onMouseEnter={scheduleClose}
            onClick={() => setMega(null)}
            aria-hidden
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}
