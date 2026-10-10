'use client'

import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { useUIStore } from '@/stores/ui-store'
import { CheckIcon, XIcon } from '@/components/kit/icons'

export default function Toaster() {
  const { toasts, removeToast } = useUIStore()
  return (
    <div data-chrome className="pointer-events-none fixed inset-x-0 bottom-5 z-[160] flex flex-col items-center gap-2 px-4" aria-live="polite" role="status">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex max-w-md items-center gap-3 rounded-full bg-noir py-2 pl-2 pr-3 text-sm text-bone shadow-[0_20px_50px_-20px_rgba(0,0,0,0.6)]"
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${t.type === 'error' ? 'bg-red-400/90 text-noir' : 'bg-gold text-ink'}`}>
              {t.type === 'error' ? <XIcon size={14} /> : <CheckIcon size={15} />}
            </span>
            <span className="py-1">{t.message}</span>
            {t.action ? (
              <Link href={t.action.href} onClick={() => removeToast(t.id)} className="ml-1 rounded-full bg-bone/10 px-3 py-1 text-label text-gold-light hover:bg-bone/20">
                {t.action.label}
              </Link>
            ) : null}
            <button type="button" onClick={() => removeToast(t.id)} aria-label="Dismiss" className="ml-1 rounded-full p-1 text-bone/50 hover:text-bone">
              <XIcon size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
