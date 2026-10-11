'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { api, ApiError } from '@/lib/api'
import { cn } from '@/lib/format'
import { ArrowRight, CheckIcon } from '@/components/kit/icons'

/** Email capture posting to /api/newsletter. Shared by the footer, home page and popup. */
export default function NewsletterForm({
  source,
  tone = 'dark',
  onSubscribed,
  className,
  cta = 'Subscribe',
}: {
  source: string
  tone?: 'dark' | 'light'
  onSubscribed?: (created: boolean) => void
  className?: string
  cta?: string
}) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (state === 'loading') return
    setState('loading')
    try {
      const res = await api<{ created: boolean; message: string }>('/api/newsletter', { body: { email, source } })
      setState('done')
      setMessage(res.message)
      onSubscribed?.(res.created)
    } catch (err) {
      setState('error')
      setMessage(err instanceof ApiError ? err.message : 'Something went wrong.')
    }
  }

  const dark = tone === 'dark'
  return (
    <form onSubmit={submit} className={cn('relative', className)} noValidate>
      <AnimatePresence mode="wait" initial={false}>
        {state === 'done' ? (
          <motion.p
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex items-center gap-3 border-b py-4 text-lead', dark ? 'border-bone/30' : 'border-ink/25')}
            role="status"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-ink">
              <CheckIcon size={16} />
            </span>
            {message}
          </motion.p>
        ) : (
          <motion.div key="form" exit={{ opacity: 0, y: -10 }} className={cn('group flex items-center border-b transition-colors', dark ? 'border-bone/30 focus-within:border-bone' : 'border-ink/25 focus-within:border-ink')}>
            <label htmlFor={`nl-${source}`} className="sr-only">
              Email address
            </label>
            <input
              id={`nl-${source}`}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (state === 'error') setState('idle')
              }}
              placeholder="Your email address"
              className={cn('min-w-0 flex-1 bg-transparent py-4 text-lead outline-none', dark ? 'placeholder:text-bone/40' : 'placeholder:text-ink/35')}
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              data-cursor="hover"
              className={cn('group/btn flex shrink-0 items-center gap-2 py-3 pl-4 text-label transition-colors', dark ? 'text-bone hover:text-gold-light' : 'text-ink hover:text-burgundy')}
            >
              {state === 'loading' ? 'Joining…' : cta}
              <ArrowRight size={16} className="transition-transform duration-500 group-hover/btn:translate-x-1" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {state === 'error' ? (
        <p role="alert" className={cn('mt-2 text-xs', dark ? 'text-red-300' : 'text-error')}>
          {message}
        </p>
      ) : null}
    </form>
  )
}
