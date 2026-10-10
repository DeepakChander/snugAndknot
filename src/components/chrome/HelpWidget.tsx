'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useUIStore } from '@/stores/ui-store'
import { useSettings } from '@/components/providers/SettingsProvider'
import { HelpIcon, MailIcon, PackageIcon, PhoneIcon, ReturnIcon, RulerIcon, XIcon } from '@/components/kit/icons'

/** Honest help hub: quick links and real contact details (no fake "live chat"). */
export default function HelpWidget() {
  const { isHelpOpen, setHelpOpen } = useUIStore()
  const { store, commerce } = useSettings()
  const pathname = usePathname()

  useEffect(() => setHelpOpen(false), [pathname, setHelpOpen])

  const links = [
    { href: '/track', label: 'Track an order', Icon: PackageIcon },
    { href: '/shipping-returns', label: `Shipping & ${commerce.returnWindowDays}-day returns`, Icon: ReturnIcon },
    { href: '/size-guide', label: 'Find your size', Icon: RulerIcon },
    { href: '/faq', label: 'Questions & answers', Icon: HelpIcon },
  ]

  return (
    <div data-chrome className="fixed bottom-5 right-4 z-[110] sm:right-6">
      <AnimatePresence>
        {isHelpOpen ? (
          <motion.div
            id="help-panel"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: 'bottom right' }}
            className="absolute bottom-16 right-0 w-[min(90vw,340px)] overflow-hidden rounded-[1.5rem] bg-ivory text-ink shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)] ring-1 ring-ink/5"
          >
            <div className="bg-noir p-5 text-bone">
              <p className="text-eyebrow text-gold">Client care</p>
              <p className="mt-2 font-display text-2xl leading-tight">How can we help?</p>
            </div>
            <ul className="p-2">
              {links.map(({ href, label, Icon }) => (
                <li key={href}>
                  <Link href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors hover:bg-ink/5">
                    <Icon size={18} className="text-burgundy" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="space-y-2 border-t border-ink/10 p-4 text-sm">
              <a href={`mailto:${store.email}`} className="flex items-center gap-3 text-stone hover:text-ink">
                <MailIcon size={16} /> {store.email}
              </a>
              {store.phone ? (
                <a href={`tel:${store.phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-3 text-stone hover:text-ink">
                  <PhoneIcon size={16} /> {store.phone}
                </a>
              ) : null}
              <Link href="/contact" className="mt-2 block rounded-full bg-ink py-2.5 text-center text-ivory transition-colors hover:bg-burgundy">
                Send us a message
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setHelpOpen(!isHelpOpen)}
        aria-expanded={isHelpOpen}
        aria-controls="help-panel"
        aria-label={isHelpOpen ? 'Close help' : 'Help'}
        data-cursor="hover"
        className="flex h-13 w-13 items-center justify-center rounded-full bg-noir text-bone shadow-[0_14px_40px_-12px_rgba(0,0,0,0.6)] ring-1 ring-bone/10 transition-transform duration-500 hover:scale-105"
        style={{ width: 52, height: 52 }}
      >
        <motion.span key={isHelpOpen ? 'x' : 'q'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
          {isHelpOpen ? <XIcon size={18} /> : <HelpIcon size={22} />}
        </motion.span>
      </button>
    </div>
  )
}
