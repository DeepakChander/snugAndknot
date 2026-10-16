'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useUIStore } from '@/stores/ui-store'
import { useAuthStore } from '@/stores/auth-store'
import { useNavData } from '@/components/providers/SettingsProvider'
import { useDialogBehaviour } from '@/components/kit/Overlay'
import { cn } from '@/lib/format'
import { DEPARTMENT_ORDER, DEPARTMENT_TITLES, type Department } from '@/lib/categories'
import CurrencySwitcher from './CurrencySwitcher'
import { departmentMenu } from './MegaMenu'
import { ChevronDown, XIcon } from '@/components/kit/icons'

const MORE = [
  { label: 'Collections', href: '/collections' },
  { label: 'Lookbook', href: '/lookbook' },
  { label: 'Journal', href: '/journal' },
  { label: 'Our story', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

/** The phone menu: a panel from the left with a tab per department, its categories, then the rest. */
export default function MobileMenu() {
  const { isMenuOpen, closeMenu } = useUIStore()
  const user = useAuthStore((s) => s.user)
  const openAuthModal = useAuthStore((s) => s.openAuthModal)
  const nav = useNavData()
  const [dept, setDept] = useState<Department>('men')
  const ref = useRef<HTMLDivElement>(null)
  useDialogBehaviour(isMenuOpen, ref, closeMenu)

  return (
    <AnimatePresence>
      {isMenuOpen ? (
        <>
          <motion.div key="menu-dim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="fixed inset-0 z-[114] bg-ink/30 lg:hidden" onClick={closeMenu} aria-hidden />
          <motion.div
            key="menu"
            ref={ref}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            data-chrome
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 left-0 z-[115] flex w-full max-w-[420px] flex-col bg-white text-ink lg:hidden"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-ink/10 pl-1 pr-2">
              <div role="tablist" aria-label="Department" className="flex h-full">
                {DEPARTMENT_ORDER.map((d) => (
                  <button
                    key={d}
                    type="button"
                    role="tab"
                    aria-selected={dept === d}
                    onClick={() => setDept(d)}
                    className={cn('relative px-4 text-[0.82rem] font-medium uppercase tracking-[0.08em]', dept === d ? 'text-ink after:absolute after:inset-x-4 after:bottom-0 after:h-0.5 after:bg-ink' : 'text-ink/55')}
                  >
                    {DEPARTMENT_TITLES[d]}
                  </button>
                ))}
              </div>
              <button type="button" onClick={closeMenu} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center">
                <XIcon size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <nav aria-label={`${DEPARTMENT_TITLES[dept]} categories`} className="px-5 pb-4 pt-2">
                {departmentMenu(nav, dept).map((g, i) => (
                  <details key={`${dept}-${g.heading}`} open={i === 0} className="group border-b border-ink/10">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[0.95rem] font-medium [&::-webkit-details-marker]:hidden">
                      {g.heading}
                      <ChevronDown size={16} className="text-ink/50 transition-transform group-open:rotate-180" />
                    </summary>
                    <ul className="pb-3">
                      {g.links.map((l) => (
                        <li key={l.href}>
                          <Link href={l.href} onClick={closeMenu} className="block py-2 pl-1 text-[0.95rem] text-ink/75">
                            {l.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </nav>

              <ul className="border-t border-ink/10 px-5 py-4">
                {MORE.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={closeMenu} className="block py-2 text-[0.9rem] text-ink/75">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-4 border-t border-ink/10 px-5 py-4 text-[0.9rem]">
              <div className="flex gap-5">
                {user ? (
                  <Link href="/account" onClick={closeMenu}>
                    My account
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      closeMenu()
                      openAuthModal('login')
                    }}
                  >
                    Sign in
                  </button>
                )}
                <Link href="/account/wishlist" onClick={closeMenu} className="text-ink/75">
                  Wishlist
                </Link>
              </div>
              <CurrencySwitcher className="text-ink/75" />
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}
