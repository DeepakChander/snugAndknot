'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import NewsletterForm from './NewsletterForm'
import { useUIStore } from '@/stores/ui-store'
import { useCartStore } from '@/stores/cart-store'
import { CopyIcon, XIcon } from '@/components/kit/icons'

const KEY = 'sk-welcome-dismissed'
const QUIET = ['/checkout', '/cart', '/account', '/track']

/**
 * The WELCOME10 offer. It arrives as a small pill in the corner and only opens into the
 * sign-up card when someone asks for it — it never sits over the page uninvited.
 */
export default function WelcomeOffer({ code = 'WELCOME10' }: { code?: string }) {
  const pathname = usePathname()
  const [mode, setMode] = useState<'hidden' | 'pill' | 'card'>('hidden')
  // Both hooks run on every render; the pill steps aside while a menu, search or the bag is open.
  const uiCovered = useUIStore((st) => st.isMenuOpen || st.isSearchOpen)
  const bagOpen = useCartStore((st) => st.isOpen)
  const covered = uiCovered || bagOpen
  const [subscribed, setSubscribed] = useState(false)
  const [copied, setCopied] = useState(false)
  // Quiet routes hide an offer that is already showing too; it comes back when the visitor leaves them.
  const quiet = QUIET.some((p) => pathname.startsWith(p))
  // Product pages have a sticky add-to-bag bar on phones; the offer sits above it.
  const bottom = pathname.startsWith('/product') ? 'bottom-[5.25rem] lg:bottom-5' : 'bottom-5'

  useEffect(() => {
    let dismissed = false
    try {
      dismissed = localStorage.getItem(KEY) === '1'
    } catch {}
    if (dismissed || quiet) return
    const t = setTimeout(() => setMode((m) => (m === 'hidden' ? 'pill' : m)), 25000)
    return () => clearTimeout(t)
  }, [pathname, quiet])

  const dismiss = () => {
    setMode('hidden')
    try {
      localStorage.setItem(KEY, '1')
    } catch {}
  }

  return (
    <AnimatePresence mode="wait">
      {covered || quiet ? null : mode === 'pill' ? (
        <motion.div
          key="pill"
          data-chrome
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed ${bottom} left-4 z-[110] flex items-center gap-1 rounded-full bg-ink p-1 text-bone shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)] sm:left-6`}
        >
          <button
            type="button"
            onClick={() => setMode('card')}
            data-cursor="hover"
            className="flex h-10 items-center gap-2 rounded-full pl-3 pr-4 font-display text-[0.86rem] font-medium tracking-[-0.01em] transition-colors hover:bg-bone/10"
          >
            <span className="flex h-6 items-center rounded-full bg-burgundy-deep px-2 font-mono text-[11px]">-10%</span>
            Your first piece
          </button>
          <button type="button" onClick={dismiss} aria-label="Dismiss offer" className="flex h-10 w-10 items-center justify-center rounded-full text-bone/55 hover:bg-bone/10 hover:text-bone">
            <XIcon size={13} />
          </button>
        </motion.div>
      ) : mode === 'card' ? (
        <motion.aside
          key="card"
          data-chrome
          aria-label="Welcome offer"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed ${bottom} left-4 z-[110] w-[min(92vw,380px)] overflow-hidden rounded-[1.75rem] bg-ink p-6 text-bone shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] sm:left-6`}
        >
          <button type="button" onClick={dismiss} aria-label="Dismiss offer" className="absolute right-4 top-4 rounded-full p-2 text-bone/50 hover:bg-bone/10 hover:text-bone">
            <XIcon size={14} />
          </button>
          <p className="text-eyebrow slash text-butter">First order</p>
          {subscribed ? (
            <>
              <p className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.04em]">Your welcome code</p>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard?.writeText(code).catch(() => {})
                  setCopied(true)
                }}
                className="mt-4 flex w-full items-center justify-between rounded-2xl border border-dashed border-butter/50 px-4 py-3 font-mono text-lg tracking-[0.2em] text-butter"
              >
                {code}
                <span className="flex items-center gap-1 text-xs tracking-normal text-bone/60">
                  <CopyIcon size={14} /> {copied ? 'Copied' : 'Copy'}
                </span>
              </button>
              <p className="mt-3 text-xs text-bone/50">Enter it at checkout for 10% off your first order.</p>
            </>
          ) : (
            <>
              <p className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.04em]">10% off your first piece</p>
              <p className="mt-2 text-sm text-bone/60">Join the atelier letter and we will show you a welcome code.</p>
              <NewsletterForm source="welcome-offer" cta="Reveal code" className="mt-3" onSubscribed={() => setSubscribed(true)} />
            </>
          )}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
