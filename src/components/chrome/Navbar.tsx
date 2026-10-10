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
import { useSettings } from '@/components/providers/SettingsProvider'
import { getLenis } from '@/lib/motion/lenis'
import { cn } from '@/lib/format'
import Wordmark from './Wordmark'
import MegaMenu, { type MegaKind } from './MegaMenu'
import { BagIcon, HeartIcon, SearchIcon, UserIcon } from '@/components/kit/icons'

const NAV: { label: string; href: string; mega?: MegaKind }[] = [
  { label: 'Shop', href: '/shop', mega: 'shop' },
  { label: 'Collections', href: '/collections', mega: 'collections' },
  { label: 'Lookbook', href: '/lookbook' },
  { label: 'Journal', href: '/journal' },
  { label: 'Atelier', href: '/about' },
]

function AnnouncementBar({ messages, link, hidden }: { messages: string[]; link: string; hidden: boolean }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (messages.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 4200)
    return () => clearInterval(t)
  }, [messages.length])
  return (
    <div
      className={cn(
        'overflow-hidden bg-noir text-bone transition-[height] duration-500 ease-[cubic-bezier(.16,1,.3,1)]',
        hidden ? 'h-0' : 'h-[34px]'
      )}
    >
      <Link href={link || '/shop'} className="relative flex h-[34px] items-center justify-center text-eyebrow text-bone/85 hover:text-gold-light">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={i}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-110%', opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute px-4 text-center"
          >
            {messages[i]}
          </motion.span>
        </AnimatePresence>
      </Link>
    </div>
  )
}

function CountBadge({ count, pulse }: { count: number; pulse?: number }) {
  if (count <= 0) return null
  return (
    <motion.span
      key={pulse}
      initial={{ scale: 0.4 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-burgundy px-1 font-mono text-[10px] leading-none text-ivory"
    >
      {count}
    </motion.span>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const settings = useSettings()
  const hydrated = useHydrated()
  const items = useCartStore((s) => s.items)
  const lastAddedAt = useCartStore((s) => s.lastAddedAt)
  const openCart = useCartStore((s) => s.openCart)
  const wishCount = useWishlistStore((s) => s.items.length)
  const user = useAuthStore((s) => s.user)
  const openAuthModal = useAuthStore((s) => s.openAuthModal)
  const { isMenuOpen, toggleMenu, closeMenu, openSearch } = useUIStore()

  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mega, setMega] = useState<MegaKind | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const headerRef = useRef<HTMLElement>(null)

  const bagCount = hydrated ? items.reduce((s, i) => s + i.quantity, 0) : 0
  const announcement = settings.announcement.enabled && settings.announcement.messages.filter(Boolean).length > 0

  // Scroll: hide on the way down, return on the way up; pick nav colour from the section underneath.
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
      const probe = (headerRef.current?.offsetHeight ?? 80) * 0.6
      let t: 'light' | 'dark' = 'light'
      for (const el of document.querySelectorAll<HTMLElement>('[data-nav-theme]')) {
        const r = el.getBoundingClientRect()
        if (r.top <= probe && r.bottom > probe) t = el.dataset.navTheme === 'dark' ? 'dark' : 'light'
      }
      setTheme(t)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sample)
    }
    sample()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    const lenis = getLenis()
    lenis?.on('scroll', onScroll)
    // Pages stream in after the shell (Suspense), so re-sample when the content changes.
    const main = document.getElementById('main')
    const mo = main ? new MutationObserver(onScroll) : null
    if (main && mo) mo.observe(main, { childList: true, subtree: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      lenis?.off('scroll', onScroll)
      mo?.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [pathname])

  useEffect(() => {
    setMega(null)
    closeMenu()
  }, [pathname, closeMenu])

  useEffect(() => {
    document.documentElement.style.setProperty('--announce-h', announcement && !scrolled ? '34px' : '0px')
  }, [announcement, scrolled])

  // Sticky page elements (shop toolbar, summaries) sit under the visible header only.
  const overlayVisible = !!mega || isMenuOpen
  useEffect(() => {
    const offset = hidden && !overlayVisible ? '0px' : `calc(var(--nav-h) + ${announcement && !scrolled ? '34px' : '0px'})`
    document.documentElement.style.setProperty('--nav-offset', offset)
  }, [hidden, overlayVisible, announcement, scrolled])

  const openMega = useCallback((kind: MegaKind) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setMega(kind)
  }, [])
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setMega(null), 180)
  }, [])

  useEffect(() => {
    if (!mega) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMega(null)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mega])

  const overlayOpen = !!mega || isMenuOpen
  const dark = overlayOpen ? true : theme === 'dark'
  const solid = scrolled && !overlayOpen

  return (
    <>
      <header
        ref={headerRef}
        data-chrome
        onMouseLeave={scheduleClose}
        className={cn(
          'fixed inset-x-0 top-0 z-[100] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)]',
          hidden && !overlayOpen ? '-translate-y-full' : 'translate-y-0'
        )}
      >
        {announcement ? <AnnouncementBar messages={settings.announcement.messages.filter(Boolean)} link={settings.announcement.link} hidden={scrolled} /> : null}

        <div
          className={cn(
            'relative transition-[background-color,color,box-shadow,backdrop-filter] duration-500',
            dark ? 'text-bone' : 'text-ink',
            solid && (dark ? 'glass-dark shadow-[0_1px_0_rgba(241,233,220,0.06)]' : 'glass shadow-[0_1px_0_rgba(22,16,14,0.06)]'),
            overlayOpen && 'bg-noir'
          )}
        >
          <nav aria-label="Main" className="mx-auto grid h-[var(--nav-h)] max-w-[1920px] grid-cols-[1fr_auto_1fr] items-center px-gutter">
            {/* Left — menu (mobile) / primary nav (desktop) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleMenu}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                data-cursor="hover"
                className="group -ml-2 flex h-11 items-center gap-3 rounded-full px-2 lg:hidden"
              >
                <span className="relative flex h-3 w-6 flex-col justify-between">
                  <span className={cn('h-px w-full origin-center bg-current transition-transform duration-500', isMenuOpen && 'translate-y-[5.5px] rotate-45')} />
                  <span className={cn('h-px w-full origin-center bg-current transition-transform duration-500', isMenuOpen && '-translate-y-[5.5px] -rotate-45')} />
                </span>
                <span className="roll hidden text-label sm:inline-flex">
                  <span data-text={isMenuOpen ? 'Close' : 'Menu'}>{isMenuOpen ? 'Close' : 'Menu'}</span>
                </span>
              </button>

              <ul className="hidden items-center gap-1 lg:flex">
                {NAV.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <li key={item.href} onMouseEnter={() => (item.mega ? openMega(item.mega) : scheduleClose())}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        aria-expanded={item.mega ? mega === item.mega : undefined}
                        aria-haspopup={item.mega ? 'true' : undefined}
                        onFocus={() => item.mega && openMega(item.mega)}
                        className="group relative flex h-11 items-center px-3.5 text-[0.84rem] tracking-[-0.005em]"
                      >
                        <span className="roll">
                          <span data-text={item.label}>{item.label}</span>
                        </span>
                        <span
                          className={cn(
                            'absolute bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold transition-all duration-500',
                            active || mega === item.mega ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                          )}
                        />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Centre — wordmark */}
            <Link href="/" aria-label={`${settings.store.name} — home`} className="justify-self-center" onMouseEnter={scheduleClose}>
              <Wordmark name={settings.store.name} className="text-[1.65rem] md:text-[1.9rem]" />
            </Link>

            {/* Right — utilities */}
            <div className="flex items-center justify-end gap-0.5 md:gap-1" onMouseEnter={scheduleClose}>
              <button
                type="button"
                onClick={openSearch}
                data-cursor="hover"
                aria-label="Search"
                className="group flex h-10 items-center gap-2 rounded-full px-2.5 transition-colors hover:bg-current/5"
              >
                <SearchIcon size={19} />
                <span className="roll hidden text-[0.84rem] xl:inline-flex">
                  <span data-text="Search">Search</span>
                </span>
              </button>
              {user ? (
                <Link
                  href="/account"
                  aria-label="Your account"
                  className="hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-current/5 sm:flex"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold font-mono text-[11px] uppercase text-ink">
                    {user.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('')}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  data-cursor="hover"
                  aria-label="Sign in"
                  className="hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-current/5 sm:flex"
                >
                  <UserIcon size={19} />
                </button>
              )}
              <Link
                href="/account/wishlist"
                aria-label={`Wishlist${hydrated && wishCount ? ` (${wishCount})` : ''}`}
                className="relative hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-current/5 sm:flex"
              >
                <HeartIcon size={19} />
                <CountBadge count={hydrated ? wishCount : 0} />
              </Link>
              <button
                type="button"
                onClick={openCart}
                data-cursor="hover"
                aria-label={`Bag, ${bagCount} item${bagCount === 1 ? '' : 's'}`}
                className="group relative flex h-10 items-center gap-2 rounded-full pl-2.5 pr-2.5 transition-colors hover:bg-current/5 md:pr-3"
              >
                <span className="relative">
                  <BagIcon size={19} />
                  <span className="md:hidden">
                    <CountBadge count={bagCount} pulse={lastAddedAt} />
                  </span>
                </span>
                <span className="hidden font-mono text-[0.78rem] tabular-nums md:inline">
                  Bag
                  <motion.span key={lastAddedAt} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="ml-1 inline-block">
                    ({bagCount})
                  </motion.span>
                </span>
              </button>
            </div>
          </nav>
        </div>

        <MegaMenu kind={mega} onEnter={() => closeTimer.current && clearTimeout(closeTimer.current)} onLeave={scheduleClose} onNavigate={() => setMega(null)} />
      </header>

      {/* Dim the page behind an open mega menu */}
      <AnimatePresence>
        {mega ? (
          <motion.div
            key="mega-dim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[90] bg-noir/45 backdrop-blur-[2px]"
            onMouseEnter={scheduleClose}
            onClick={() => setMega(null)}
            aria-hidden
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}
