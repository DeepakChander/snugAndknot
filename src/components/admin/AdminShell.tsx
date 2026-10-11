'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Wordmark from '@/components/chrome/Wordmark'
import Toaster from '@/components/chrome/Toaster'
import { SettingsProvider, type NavData, type PublicSettings } from '@/components/providers/SettingsProvider'
import { api } from '@/lib/api'
import { cn } from '@/lib/format'
import type { PublicUser } from '@/types/commerce'

export interface AdminCounts {
  awaitingFulfilment: number
  pendingReviews: number
  newMessages: number
  pendingReturns: number
}

const GROUPS = [
  { label: 'Overview', items: [{ href: '/admin', label: 'Dashboard' }] },
  {
    label: 'Catalogue',
    items: [
      { href: '/admin/products', label: 'Products' },
      { href: '/admin/collections', label: 'Collections' },
      { href: '/admin/categories', label: 'Categories' },
      { href: '/admin/media', label: 'Media' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { href: '/admin/orders', label: 'Orders', count: 'awaitingFulfilment' as const },
      { href: '/admin/returns', label: 'Returns', count: 'pendingReturns' as const },
      { href: '/admin/coupons', label: 'Discount codes' },
    ],
  },
  {
    label: 'People',
    items: [
      { href: '/admin/customers', label: 'Customers' },
      { href: '/admin/reviews', label: 'Reviews', count: 'pendingReviews' as const },
      { href: '/admin/inbox', label: 'Inbox', count: 'newMessages' as const },
    ],
  },
  { label: 'Store', items: [{ href: '/admin/settings', label: 'Settings' }, { href: '/admin/emails', label: 'Emails' }] },
]

const EMPTY_NAV: NavData = { collections: [], categories: [], spotlight: [], genders: { men: 0, women: 0, kids: 0 } }

export default function AdminShell({
  user,
  counts,
  database,
  settings,
  children,
}: {
  user: PublicUser
  counts: AdminCounts
  database: { kind: string; persistent: boolean }
  settings: PublicSettings
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])

  const nav = (
    <nav aria-label="Admin" className="space-y-6">
      {GROUPS.map((g) => (
        <div key={g.label}>
          <p className="px-3 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-bone/40">{g.label}</p>
          <ul className="mt-2 space-y-0.5">
            {g.items.map((it) => {
              const active = it.href === '/admin' ? pathname === '/admin' : pathname.startsWith(it.href)
              const n = 'count' in it && it.count ? counts[it.count] : 0
              return (
                <li key={it.href}>
                  <Link href={it.href} aria-current={active ? 'page' : undefined} className={cn('relative flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors', active ? 'text-ink' : 'text-bone/70 hover:bg-bone/[0.06] hover:text-bone')}>
                    {active ? <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-bone" transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} /> : null}
                    <span className="relative">{it.label}</span>
                    {n ? <span className={cn('relative rounded-full px-2 py-0.5 text-[0.7rem] font-medium', active ? 'bg-burgundy text-ivory' : 'bg-gold text-ink')}>{n}</span> : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )

  return (
    <SettingsProvider settings={settings} nav={EMPTY_NAV}>
      <div className="min-h-[100svh] bg-[#f6f2ea] text-ink">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-noir px-4 py-6 text-bone lg:flex">
          <Link href="/admin" className="px-3">
            <Wordmark className="text-2xl" name={settings.store.name} />
            <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.2em] text-gold">Admin</span>
          </Link>
          <div className="mt-8 flex-1 overflow-y-auto">{nav}</div>
          <div className="mt-6 border-t border-bone/10 px-3 pt-4 text-xs text-bone/60">
            <p className="truncate text-bone/80">{user.name}</p>
            <p className="truncate">{user.email}</p>
            <div className="mt-3 flex gap-3">
              <Link href="/" className="hover:text-bone">
                View store ↗
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
                  router.push('/admin/login')
                  router.refresh()
                }}
                className="hover:text-bone"
              >
                Sign out
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between bg-noir px-4 py-3 text-bone lg:hidden">
          <Link href="/admin">
            <Wordmark className="text-xl" name={settings.store.name} />
          </Link>
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="rounded-full border border-bone/20 px-4 py-1.5 text-sm">
            {open ? 'Close' : 'Menu'}
          </button>
        </header>
        <AnimatePresence>
          {open ? (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="fixed inset-x-0 top-[52px] z-30 max-h-[calc(100svh-52px)] overflow-y-auto bg-noir px-4 py-6 text-bone lg:hidden">
              {nav}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="lg:pl-64">
          {!database.persistent ? (
            <div className="bg-gold/30 px-6 py-2.5 text-sm text-ink">
              <strong>Demo database.</strong> No <code className="font-mono text-xs">DATABASE_URL</code> is configured, so changes here are kept in memory and will be lost when the server restarts. Connect a Postgres database to make them permanent.
            </div>
          ) : null}
          <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-10">{children}</main>
        </div>
        <Toaster />
      </div>
    </SettingsProvider>
  )
}
