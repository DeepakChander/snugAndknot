'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import NewsletterForm from './NewsletterForm'
import { CopyIcon, XIcon } from '@/components/kit/icons'

const KEY = 'sk-welcome-dismissed'
const QUIET = ['/checkout', '/cart', '/account', '/track']

/** A small, dismissible card — never a blocking modal — offering the WELCOME10 code for subscribing. */
export default function WelcomeOffer({ code = 'WELCOME10' }: { code?: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let dismissed = false
    try {
      dismissed = localStorage.getItem(KEY) === '1'
    } catch {}
    if (dismissed || QUIET.some((p) => pathname.startsWith(p))) return
    const t = setTimeout(() => setOpen(true), 18000)
    return () => clearTimeout(t)
  }, [pathname])

  const dismiss = () => {
    setOpen(false)
    try {
      localStorage.setItem(KEY, '1')
    } catch {}
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.aside
          data-chrome
          aria-label="Welcome offer"
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-5 left-4 z-[110] w-[min(92vw,380px)] overflow-hidden rounded-[1.75rem] bg-noir p-6 text-bone shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] sm:left-6"
        >
          <button type="button" onClick={dismiss} aria-label="Dismiss offer" className="absolute right-4 top-4 rounded-full p-2 text-bone/50 hover:bg-bone/10 hover:text-bone">
            <XIcon size={14} />
          </button>
          <p className="text-eyebrow text-gold">First order</p>
          {subscribed ? (
            <>
              <p className="mt-3 font-display text-3xl leading-tight">Your welcome code</p>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard?.writeText(code).catch(() => {})
                  setCopied(true)
                }}
                className="mt-4 flex w-full items-center justify-between rounded-2xl border border-dashed border-gold/50 px-4 py-3 font-mono text-lg tracking-[0.2em] text-gold-light"
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
              <p className="mt-3 font-display text-3xl leading-tight">10% off your first piece</p>
              <p className="mt-2 text-sm text-bone/60">Join the atelier letter and we will show you a welcome code.</p>
              <NewsletterForm source="welcome-offer" cta="Reveal code" className="mt-3" onSubscribed={() => setSubscribed(true)} />
            </>
          )}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  )
}
