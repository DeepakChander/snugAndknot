'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import { Button } from '@/components/kit/Button'
import { LogoutIcon } from '@/components/kit/icons'
import { cn, TIER_LABEL } from '@/lib/format'
import type { PublicUser } from '@/types/commerce'

const NAV = [
  { href: '/account', label: 'Overview' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/returns', label: 'Returns' },
  { href: '/account/rewards', label: 'Rewards' },
  { href: '/account/wishlist', label: 'Wishlist' },
  { href: '/account/profile', label: 'Profile' },
]

export default function AccountShell({ user, children }: { user: PublicUser; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const logout = useAuthStore((s) => s.logout)
  const addToast = useUIStore((s) => s.addToast)

  return (
    <div className="bg-ivory pb-28 pt-nav text-ink">
      <div className="container-wide pt-10 md:pt-14">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/10 pb-8">
          <div>
            <p className="text-eyebrow text-stone">
              {TIER_LABEL[user.tier]} member · {user.points.toLocaleString()} points
            </p>
            <h1 className="mt-3 text-display">Hello, {user.name.split(' ')[0]}</h1>
          </div>
          <button
            type="button"
            onClick={async () => {
              await logout()
              addToast('You are signed out.')
              router.push('/')
            }}
            className="flex items-center gap-2 text-sm text-stone hover:text-ink"
          >
            <LogoutIcon size={18} /> Sign out
          </button>
        </div>
        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
          <nav aria-label="Account" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 lg:sticky lg:top-[calc(var(--nav-offset)+1.5rem)] lg:flex-col lg:self-start">
            {NAV.map((n) => {
              const active = n.href === '/account' ? pathname === n.href : pathname.startsWith(n.href)
              return (
                <Link key={n.href} href={n.href} aria-current={active ? 'page' : undefined} className={cn('relative shrink-0 rounded-full px-4 py-2.5 text-sm transition-colors', active ? 'text-ivory' : 'text-ink/70 hover:text-ink')}>
                  {active ? <motion.span layoutId="acct-nav" className="absolute inset-0 rounded-full bg-ink" transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} /> : null}
                  <span className="relative">{n.label}</span>
                </Link>
              )
            })}
          </nav>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function AccountGate() {
  const openAuthModal = useAuthStore((s) => s.openAuthModal)
  return (
    <div className="min-h-[80svh] bg-ivory pt-nav text-ink">
      <div className="container-wide grid items-center gap-12 py-20 md:grid-cols-2">
        <div>
          <p className="text-eyebrow text-stone">Your account</p>
          <h1 className="mt-5 text-display">Sign in to your account</h1>
          <p className="mt-6 max-w-md text-lead text-stone">See your orders and returns, keep a wishlist, and collect points on every piece.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button size="lg" arrow onClick={() => openAuthModal('login')}>
              Sign in
            </Button>
            <Button size="lg" variant="outline" onClick={() => openAuthModal('signup')}>
              Create an account
            </Button>
          </div>
          <p className="mt-8 text-sm text-stone">
            Checked out as a guest?{' '}
            <Link href="/track" className="link-wipe text-ink">
              Track your order
            </Link>
          </p>
        </div>
        <div className="relative hidden aspect-[4/5] overflow-hidden md:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/_next/image?url=%2Fimages%2Flookbook%2Fsoft-focus-2.png&w=1080&q=75" alt="" className="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  )
}
