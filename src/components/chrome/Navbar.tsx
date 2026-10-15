'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCartStore } from '@/stores/cart-store'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { useWishlistStore } from '@/stores/wishlist-store'
import { useHydrated } from '@/hooks/use-hydrated'
import { useNavData, useSettings } from '@/components/providers/SettingsProvider'
import { getLenis } from '@/lib/motion/lenis'
import { cn } from '@/lib/format'
import Wordmark from './Wordmark'
import { BagIcon, HeartIcon, SearchIcon, UserIcon } from '@/components/kit/icons'

/** Main links. Departments appear only while they have pieces, so no link leads to an empty page. */
function useNav() {
  const { genders } = useNavData()
  return [
    { label: 'Home', href: '/' },
    ...(genders.men ? [{ label: 'Men', href: '/shop/men' }] : []),
    ...(genders.women ? [{ label: 'Women', href: '/shop/women' }] : []),
    ...(genders.kids ? [{ label: 'Kids', href: '/shop/kids' }] : []),
    { label: 'Shop all', href: '/shop' },
    { label: 'Collections', href: '/collections' },
    { label: 'About', href: '/about' },
  ]
}

/**
 * The messages in one quiet row, divided by bars ("Free shipping | Premium quality | …"). Phones,
 * which have no room for the row, show one message at a time instead.
 */
function AnnouncementBar({ messages, link, hidden }: { messages: string[]; link: string; hidden: boolean }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (messages.length < 2) return
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), 4200)
    return () => clearInterval(t)
  }, [messages.length])
  return (
    <div className={cn('overflow-hidden bg-ink text-bone transition-[height] duration-500 ease-[cubic-bezier(.16,1,.3,1)]', hidden ? 'h-0' : 'h-[34px]')}>
      <Link href={link || '/shop'} className="flex h-[34px] items-center justify-center px-4 text-[0.72rem] tracking-[0.06em] text-bone/85 transition-colors hover:text-bone">
        <span className="hidden items-center md:flex">
          {messages.map((m, n) => (
            <span key={m} className="flex items-center">
              {n ? <span aria-hidden className="mx-4 h-3 w-px bg-bone/30" /> : null}
              {m}
            </span>
          ))}
        </span>
        <span className="relative flex h-full w-full items-center justify-center md:hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={i}
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: '0%', opacity: 1 }}
              exit={{ y: '-110%', opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute text-center"
            >
              {messages[i]}
            </motion.span>
          </AnimatePresence>
        </span>
      </Link>
    </div>
  )
}

const iconBtn = 'relative flex h-10 w-10 items-center justify-center text-ink/80 transition-colors hover:text-ink'

export default function Navbar() {
  const pathname = usePathname()
  const settings = useSettings()
  const nav = useNav()
  const hydrated = useHydrated()
  const items = useCartStore((s) => s.items)
  const lastAddedAt = useCartStore((s) => s.lastAddedAt)
  const openCart = useCartStore((s) => s.openCart)
  const wishCount = useWishlistStore((s) => s.items.length)
  const user = useAuthStore((s) => s.user)
  const openAuthModal = useAuthStore((s) => s.openAuthModal)
  const { isMenuOpen, toggleMenu, closeMenu, openSearch } = useUIStore()

  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  const bagCount = hydrated ? items.reduce((s, i) => s + i.quantity, 0) : 0
  const announcement = settings.announcement.enabled && settings.announcement.messages.filter(Boolean).length > 0

  // Scroll: hide on the way down, return on the way up.
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
    const lenis = getLenis()
    lenis?.on('scroll', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      lenis?.off('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [pathname])

  useEffect(() => {
    closeMenu()
    // A new page always starts with the header visible.
    setHidden(false)
  }, [pathname, closeMenu])

  useEffect(() => {
    document.documentElement.style.setProperty('--announce-h', announcement && !scrolled ? '34px' : '0px')
  }, [announcement, scrolled])

  // Sticky page elements (shop toolbar, summaries) sit under the visible header only.
  useEffect(() => {
    const offset = hidden && !isMenuOpen ? '0px' : `calc(var(--nav-h) + ${announcement && !scrolled ? '34px' : '0px'})`
    document.documentElement.style.setProperty('--nav-offset', offset)
  }, [hidden, isMenuOpen, announcement, scrolled])

  return (
    <header
      ref={headerRef}
      data-chrome
      className={cn('fixed inset-x-0 top-0 z-[100] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)]', hidden && !isMenuOpen ? '-translate-y-full' : 'translate-y-0')}
    >
      {announcement ? <AnnouncementBar messages={settings.announcement.messages.filter(Boolean)} link={settings.announcement.link} hidden={scrolled} /> : null}

      <div className={cn('border-b bg-bone/95 backdrop-blur-md transition-colors duration-500', scrolled ? 'border-ink/10' : 'border-transparent')}>
        <nav aria-label="Main" className="mx-auto grid h-[var(--nav-h)] max-w-[1920px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-gutter text-ink">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              className={cn(iconBtn, '-ml-2 lg:hidden')}
            >
              <span className="relative flex h-2.5 w-[18px] flex-col justify-between">
                <span className={cn('h-[1.5px] w-full origin-center bg-current transition-transform duration-500', isMenuOpen && 'translate-y-[4.25px] rotate-45')} />
                <span className={cn('h-[1.5px] w-full origin-center bg-current transition-transform duration-500', isMenuOpen && '-translate-y-[4.25px] -rotate-45')} />
              </span>
            </button>
            <Link href="/" aria-label={`${settings.store.name} — home`} className="hidden lg:block">
              <Wordmark name={settings.store.name} variant="spaced" className="text-[1.15rem]" />
            </Link>
          </div>

          <div className="justify-self-center">
            <Link href="/" aria-label={`${settings.store.name} — home`} className="lg:hidden">
              <Wordmark name={settings.store.name} variant="spaced" className="text-[0.98rem]" />
            </Link>
            <ul className="hidden items-center gap-8 lg:flex xl:gap-10">
              {nav.map((item) => {
                const active = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'relative block py-2 text-[0.84rem] tracking-[0.02em] transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-ink after:transition-transform after:duration-300',
                        active ? 'text-ink after:scale-x-100' : 'text-ink/70 after:scale-x-0 hover:text-ink hover:after:scale-x-100'
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="-mr-2 flex items-center justify-end">
            <button type="button" onClick={openSearch} aria-label="Search" className={iconBtn}>
              <SearchIcon size={19} />
            </button>
            {user ? (
              <Link href="/account" aria-label="Your account" className={cn(iconBtn, 'hidden sm:flex')}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[10px] font-medium uppercase text-bone">
                  {user.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('')}
                </span>
              </Link>
            ) : (
              <button type="button" onClick={() => openAuthModal('login')} aria-label="Sign in" className={cn(iconBtn, 'hidden sm:flex')}>
                <UserIcon size={19} />
              </button>
            )}
            <Link href="/account/wishlist" aria-label={`Wishlist${hydrated && wishCount ? ` (${wishCount})` : ''}`} className={cn(iconBtn, 'hidden md:flex')}>
              <HeartIcon size={19} />
              {hydrated && wishCount > 0 ? <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-burgundy" aria-hidden /> : null}
            </Link>
            <button type="button" onClick={openCart} aria-label={`Bag, ${bagCount} item${bagCount === 1 ? '' : 's'}`} className={iconBtn}>
              <BagIcon size={20} />
              {bagCount > 0 ? (
                <motion.span
                  key={lastAddedAt}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                  className="absolute right-0.5 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-ink px-1 text-[10px] font-medium leading-none tabular-nums text-bone"
                >
                  {bagCount}
                </motion.span>
              ) : null}
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}
