'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { useSettings } from '@/components/providers/SettingsProvider'
import { useDialogBehaviour } from '@/components/kit/Overlay'
import { InstagramIcon, PinterestIcon, TiktokIcon } from '@/components/kit/icons'

const EASE = [0.16, 1, 0.3, 1] as const

const LINKS = [
  { label: 'Shop all', href: '/shop' },
  { label: 'Women', href: '/shop/women' },
  { label: 'Men', href: '/shop/men' },
  { label: 'Collections', href: '/collections' },
  { label: 'Lookbook', href: '/lookbook' },
  { label: 'Journal', href: '/journal' },
  { label: 'The Atelier', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function MobileMenu() {
  const { isMenuOpen, closeMenu, openSearch } = useUIStore()
  const user = useAuthStore((s) => s.user)
  const openAuthModal = useAuthStore((s) => s.openAuthModal)
  const { store } = useSettings()
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
          initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.85, ease: [0.87, 0, 0.13, 1] }}
          className="fixed inset-0 z-[95] flex flex-col overflow-y-auto bg-noir pt-[calc(var(--nav-h)+var(--announce-h))] text-bone lg:hidden"
        >
          <div className="knit-texture pointer-events-none absolute inset-0 text-bone opacity-40" aria-hidden />
          {/* Keyboard users stay trapped in the dialog, so give them a close control inside it. */}
          <button type="button" onClick={closeMenu} className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-[calc(var(--nav-h)+0.5rem)] focus:rounded-full focus:bg-bone focus:px-4 focus:py-2 focus:text-ink">
            Close menu
          </button>
          <nav aria-label="Mobile" className="relative flex-1 px-gutter pt-6">
            <ul>
              {LINKS.map((l, i) => (
                <li key={l.href} className="overflow-hidden border-b border-bone/10">
                  <motion.div
                    initial={{ y: '105%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '105%' }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.25 + i * 0.05 }}
                  >
                    <Link href={l.href} onClick={closeMenu} className="flex items-baseline gap-4 py-3">
                      <span className="w-6 font-mono text-[0.65rem] text-gold">{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-display text-[clamp(2.4rem,11vw,4rem)] leading-[0.95] tracking-[-0.02em]">{l.label}</span>
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
              <p className="text-eyebrow text-taupe">Account</p>
              {user ? (
                <>
                  <Link href="/account" onClick={closeMenu} className="block">
                    {user.name}
                  </Link>
                  <Link href="/account/orders" onClick={closeMenu} className="block text-bone/70">
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
              <Link href="/account/wishlist" onClick={closeMenu} className="block text-bone/70">
                Wishlist
              </Link>
              <button type="button" onClick={openSearch} className="block text-bone/70">
                Search
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-eyebrow text-taupe">Say hello</p>
              <a href={`mailto:${store.email}`} className="block break-all">
                {store.email}
              </a>
              {store.phone ? (
                <a href={`tel:${store.phone.replace(/[^+\d]/g, '')}`} className="block text-bone/70">
                  {store.phone}
                </a>
              ) : null}
              <div className="flex gap-3 pt-2 text-bone/70">
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
