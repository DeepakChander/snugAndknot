'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { useNavData, useSettings } from '@/components/providers/SettingsProvider'
import { useDialogBehaviour } from '@/components/kit/Overlay'
import CurrencySwitcher from './CurrencySwitcher'
import { InstagramIcon, PinterestIcon, TiktokIcon } from '@/components/kit/icons'

const EASE = [0.16, 1, 0.3, 1] as const


export default function MobileMenu() {
  const { isMenuOpen, closeMenu, openSearch } = useUIStore()
  const user = useAuthStore((s) => s.user)
  const openAuthModal = useAuthStore((s) => s.openAuthModal)
  const { store } = useSettings()
  const { genders } = useNavData()
  // Departments appear only while they have pieces, as in the header.
  const links = [
    { label: 'Home', href: '/' },
    ...(genders.men ? [{ label: 'Men', href: '/shop/men' }] : []),
    ...(genders.women ? [{ label: 'Women', href: '/shop/women' }] : []),
    ...(genders.kids ? [{ label: 'Kids', href: '/shop/kids' }] : []),
    { label: 'Shop all', href: '/shop' },
    { label: 'Collections', href: '/collections' },
    { label: 'Journal', href: '/journal' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]
  const ref = useRef<HTMLDivElement>(null)
  useDialogBehaviour(isMenuOpen, ref, closeMenu)

  return (
    <AnimatePresence>
      {isMenuOpen ? (
        <motion.div
          ref={ref}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-chrome
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed inset-0 z-[95] flex flex-col overflow-y-auto bg-bone pt-[calc(var(--nav-h)+var(--announce-h))] text-ink lg:hidden"
        >
          {/* Keyboard users stay trapped in the dialog, so give them a close control inside it. */}
          <button type="button" onClick={closeMenu} className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-[calc(var(--nav-h)+0.5rem)] focus:rounded-full focus:bg-bone focus:px-4 focus:py-2 focus:text-ink">
            Close menu
          </button>
          <nav aria-label="Mobile" className="relative flex-1 px-gutter pt-6">
            <ul>
              {links.map((l, i) => (
                <li key={l.href} className="border-b border-ink/10">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.05 + i * 0.03 }}>
                    <Link href={l.href} onClick={closeMenu} className="flex items-center justify-between py-4">
                      <span className="font-serif text-[1.9rem] leading-none">{l.label}</span>
                      <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 text-ink/50">
                        <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.6 }}
            className="relative grid grid-cols-2 gap-6 px-gutter pb-10 pt-10 text-sm"
          >
            <div className="space-y-2">
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-stone">Account</p>
              {user ? (
                <>
                  <Link href="/account" onClick={closeMenu} className="block">
                    {user.name}
                  </Link>
                  <Link href="/account/orders" onClick={closeMenu} className="block text-ink/70">
                    Orders
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    closeMenu()
                    openAuthModal('login')
                  }}
                  className="block"
                >
                  Sign in / Join
                </button>
              )}
              <Link href="/account/wishlist" onClick={closeMenu} className="block text-ink/70">
                Wishlist
              </Link>
              <button type="button" onClick={openSearch} className="block text-ink/70">
                Search
              </button>
              <CurrencySwitcher className="pt-2 text-ink/70" />
            </div>
            <div className="space-y-2">
              <p className="text-[0.7rem] uppercase tracking-[0.2em] text-stone">Say hello</p>
              <a href={`mailto:${store.email}`} className="block text-[0.8rem] [overflow-wrap:anywhere]">
                {store.email}
              </a>
              {store.phone ? (
                <a href={`tel:${store.phone.replace(/[^+\d]/g, '')}`} className="block text-ink/70">
                  {store.phone}
                </a>
              ) : null}
              <div className="flex gap-3 pt-2 text-ink/70">
                {store.social.instagram ? (
                  <a href={store.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <InstagramIcon size={18} />
                  </a>
                ) : null}
                {store.social.pinterest ? (
                  <a href={store.social.pinterest} target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                    <PinterestIcon size={18} />
                  </a>
                ) : null}
                {store.social.tiktok ? (
                  <a href={store.social.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                    <TiktokIcon size={18} />
                  </a>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
