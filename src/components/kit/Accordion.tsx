'use client'

import { useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/format'

export function AccordionItem({ title, children, defaultOpen = false, className }: { title: ReactNode; children: ReactNode; defaultOpen?: boolean; className?: string }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <div className={cn('border-b border-current/10', className)}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-btn`}
          onClick={() => setOpen((o) => !o)}
          data-cursor="hover"
          className="flex w-full items-center justify-between gap-4 py-5 text-left font-sans text-[0.95rem]"
        >
          {title}
          <span className="relative h-3 w-3 shrink-0" aria-hidden>
            <span className="absolute left-0 top-1/2 h-px w-3 bg-current" />
            <span className={cn('absolute left-0 top-1/2 h-px w-3 bg-current transition-transform duration-500', open ? 'rotate-0' : 'rotate-90')} />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-btn`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-sm leading-relaxed opacity-75">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
