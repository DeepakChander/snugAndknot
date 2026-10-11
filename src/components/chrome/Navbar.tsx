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
import { HeartIcon, SearchIcon, UserIcon } from '@/components/kit/icons'

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
        'overflow-hidden bg-ink text-bone transition-[height] duration-500 ease-[cubic-bezier(.16,1,.3,1)]',
        hidden ? 'h-0' : 'h-[34px]'
      )}
    >
      <Link href={link || '/shop'} className="relative flex h-[34px] items-center justify-center text-eyebrow text-bone/80 transition-colors hover:text-butter">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={i}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-110%', opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute px-4 text-center"
          >
            <span className="mr-2 inline-block h-1.5 w-1.5 -translate-y-px rounded-full bg-signal align-middle" aria-hidden />
            {messages[i]}
          </motion.span>
        </AnimatePresence>
      </Link>
    </div>
  )
}

/** `tone` names the ink of an empty bubble: 'dark' on the bone chip, 'light' on the ink chip. */
function CountBubble({ count, pulse, tone }: { count: number; pulse?: number; tone: 'light' | 'dark' }) {
  return (
    <motion.span
      key={pulse}
      initial={{ scale: 0.4 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 18 }}
      className={cn(
        'flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1.5 font-mono text-[11px] leading-none tabular-nums',
        count > 0 ? 'bg-burgundy-deep text-bone' : tone === 'dark' ? 'bg-ink/10 text-ink' : 'bg-bone/15 text-bone'
      )}
    >
      {count}
    </motion.span>
  )
}

/** Chip surfaces: frosted glass for groups and icons, solid for the logo and the bag. */
const glassChip = (dark: boolean) =>
  dark ? 'bg-noir/45 text-bone ring-1 ring-bone/12 backdrop-blur-xl' : 'bg-bone/70 text-ink ring-1 ring-ink/[0.07] backdrop-blur-xl'
const solidChip = (dark: boolean) => (dark ? 'bg-bone text-ink' : 'bg-ink text-bone')

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
      // The centre of the bar decides; the x test matters for panels that slide sideways.
      const probeX = window.innerWidth / 2
      let t: 'light' | 'dark' = 'light'
      for (const el of document.querySelectorAll<HTMLElement>('[data-nav-theme]')) {
        const r = el.getBoundingClientRect()
        if (r.top <= probe && r.bottom > probe && r.left <= probeX && r.right > probeX) t = el.dataset.navTheme === 'dark' ? 'dark' : 'light'
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
    // A new page always starts with the header visible.
    setHidden(false)
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
  const dark = isMenuOpen ? true : !!mega ? false : theme === 'dark'

  const logo = (cls: string) => (
    <Link
      href="/"
      aria-label={`${settings.store.name} — home`}
      onMouseEnter={scheduleClose}
      className={cn('group flex h-10 items-center rounded-full px-3.5 transition-colors duration-500 sm:px-4', solidChip(dark), cls)}
    >
      <Wordmark name={settings.store.name} variant="chip" className="text-[0.74rem] sm:text-[0.8rem]" />
    </Link>
  )

  return (
    <>
      <header
        ref={headerRef}
        data-chrome
        onMouseLeave={scheduleClose}
        onBlur={(e) => {
          if (!headerRef.current?.contains(e.relatedTarget as Node | null)) setMega(null)
        }}
        className={cn(
          'fixed inset-x-0 top-0 z-[100] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)]',
          hidden && !overlayOpen ? '-translate-y-full' : 'translate-y-0'
        )}
      >
        {announcement ? <AnnouncementBar messages={settings.announcement.messages.filter(Boolean)} link={settings.announcement.link} hidden={scrolled} /> : null}

        <div className={cn('relative transition-colors duration-500', mega && 'bg-ivory')}>
          <nav aria-label="Main" className="mx-auto grid h-[var(--nav-h)] max-w-[1920px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-gutter">
            {/* Left — menu chip (mobile) and logo chip (desktop) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMenu}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                data-cursor="hover"
                className={cn('group flex h-10 min-w-10 items-center justify-center gap-2.5 rounded-full px-3 transition-colors duration-500 sm:pl-3.5 sm:pr-4 lg:hidden', glassChip(dark))}
              >
                <span className="relative flex h-2.5 w-[18px] flex-col justify-between">
                  <span className={cn('h-[1.5px] w-full origin-center rounded bg-current transition-transform duration-500', isMenuOpen && 'translate-y-[4.25px] rotate-45')} />
                  <span className={cn('h-[1.5px] w-full origin-center rounded bg-current transition-transform duration-500', isMenuOpen && '-translate-y-[4.25px] -rotate-45')} />
                </span>
                <span className="roll hidden font-display text-[0.84rem] font-medium tracking-[-0.01em] sm:inline-flex">
                  <span data-text={isMenuOpen ? 'Close' : 'Menu'}>{isMenuOpen ? 'Close' : 'Menu'}</span>
                </span>
              </button>
              {logo('hidden lg:flex')}
            </div>

            {/* Centre — logo (mobile) / link pill (desktop) */}
            <div className="justify-self-center">
              {logo('lg:hidden')}
              <ul className={cn('hidden items-center gap-0.5 rounded-full p-1 transition-colors duration-500 lg:flex', glassChip(dark))}>
                {NAV.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  const highlighted = active || (!!item.mega && mega === item.mega)
                  return (
                    <li key={item.href} onMouseEnter={() => (item.mega ? openMega(item.mega) : scheduleClose())}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        aria-expanded={item.mega ? mega === item.mega : undefined}
                        aria-haspopup={item.mega ? 'true' : undefined}
                        onFocus={() => item.mega && openMega(item.mega)}
                        className={cn(
                          'group relative flex h-9 items-center gap-1.5 rounded-full px-4 font-display text-[0.86rem] font-medium tracking-[-0.01em] transition-colors duration-500',
                          highlighted ? solidChip(dark) : dark ? 'text-bone/80 hover:text-bone' : 'text-ink/75 hover:text-ink'
                        )}
                      >
                        {active ? <span className="h-1.5 w-1.5 rounded-full bg-signal" aria-hidden /> : null}
                        <span className="roll">
                          <span data-text={item.label}>{item.label}</span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Right — utility chips */}
            <div className="flex items-center justify-end gap-1.5" onMouseEnter={scheduleClose}>
              <button
                type="button"
                onClick={openSearch}
                data-cursor="hover"
                aria-label="Search"
                className={cn('hidden h-10 w-10 items-center justify-center rounded-full transition-colors duration-500 sm:flex xl:w-auto xl:gap-2 xl:px-4', glassChip(dark))}
              >
                <SearchIcon size={17} />
                <span className="roll hidden font-display text-[0.84rem] font-medium tracking-[-0.01em] xl:inline-flex">
                  <span data-text="Search">Search</span>
                </span>
              </button>
              {user ? (
                <Link
                  href="/account"
                  aria-label="Your account"
                  className={cn('hidden h-10 w-10 items-center justify-center rounded-full transition-colors duration-500 sm:flex', glassChip(dark))}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-butter font-mono text-[11px] uppercase text-ink">
                    {user.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('')}
                  </span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  data-cursor="hover"
                  aria-label="Sign in"
                  className={cn('hidden h-10 w-10 items-center justify-center rounded-full transition-colors duration-500 sm:flex', glassChip(dark))}
                >
                  <UserIcon size={17} />
                </button>
              )}
              <Link
                href="/account/wishlist"
                aria-label={`Wishlist${hydrated && wishCount ? ` (${wishCount})` : ''}`}
                className={cn('relative hidden h-10 w-10 items-center justify-center rounded-full transition-colors duration-500 md:flex', glassChip(dark))}
              >
                <HeartIcon size={17} />
                {hydrated && wishCount > 0 ? <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-signal" aria-hidden /> : null}
              </Link>
              <button
                type="button"
                onClick={openCart}
                data-cursor="hover"
                aria-label={`Bag, ${bagCount} item${bagCount === 1 ? '' : 's'}`}
                className={cn('group flex h-10 items-center gap-2 rounded-full pl-4 pr-1.5 transition-colors duration-500', solidChip(dark))}
              >
                <span className="roll font-display text-[0.84rem] font-medium tracking-[-0.01em]">
                  <span data-text="Bag">Bag</span>
                </span>
                <CountBubble count={bagCount} pulse={lastAddedAt} tone={dark ? 'dark' : 'light'} />
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
            className="fixed inset-0 z-[90] bg-ink/30 backdrop-blur-[3px]"
            onMouseEnter={scheduleClose}
            onClick={() => setMega(null)}
            aria-hidden
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}
