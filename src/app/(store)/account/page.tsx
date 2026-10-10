'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { useUIStore } from '@/stores/ui-store'
import TextReveal from '@/components/animation/TextReveal'
import FadeIn from '@/components/animation/FadeIn'
import { LOYALTY_TIERS } from '@/types'
import type { LoyaltyTier } from '@/types'

/* ──────────────────────────────────────────────────────────
   ACCOUNT DASHBOARD
   Grid of quick links with glass-morphism cards,
   user tier badge, points display, and logout
   ────────────────────────────────────────────────────────── */

const quickLinks = [
  {
    title: 'Orders',
    description: 'Track your purchases and delivery status',
    href: '/account/orders',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M20 12V5.749a.6.6 0 00-.176-.425l-3.148-3.148A.6.6 0 0016.252 2H4.6a.6.6 0 00-.6.6v18.8a.6.6 0 00.6.6H11" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 2v3.4a.6.6 0 00.6.6H20" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 19h6M19 16v6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Wishlist',
    description: 'View and manage your saved pieces',
    href: '/account/wishlist',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Rewards',
    description: 'Check your points and unlock perks',
    href: '/account/rewards',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 15l-3.5 2 1-3.9L6 10.5l4-.3L12 6.5l2 3.7 4 .3-3.5 2.6 1 3.9z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="10" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Returns',
    description: 'Initiate or track a return request',
    href: '/account/returns',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M9 14l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10h11a4 4 0 010 8h-1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const tierColors: Record<LoyaltyTier, string> = {
  thread: 'bg-dust text-burgundy',
  stitch: 'bg-gold-muted text-burgundy-deep',
  weave: 'bg-gold text-burgundy-deep',
  tapestry: 'bg-burgundy text-gold',
}

export default function AccountPage() {
  const { user, isAuthenticated, openAuthModal, logout } = useAuthStore()
  const addToast = useUIStore((s) => s.addToast)

  const handleLogout = useCallback(() => {
    logout()
    addToast('You have been signed out.', 'info')
  }, [logout, addToast])

  // --------------------------------------------------
  // Unauthenticated state
  // --------------------------------------------------
  if (!isAuthenticated || !user) {
    return (
      <div className="pt-24 pb-32 bg-ivory min-h-screen">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto text-center py-24">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-burgundy/10 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7 text-burgundy">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl text-burgundy mb-3">
              Your Account
            </h1>
            <p className="text-wine/70 mb-8 leading-relaxed">
              Sign in to view your orders, manage your wishlist, and track your
              rewards.
            </p>
            <button
              onClick={() => openAuthModal('login')}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold tracking-wider uppercase bg-burgundy text-gold hover:bg-burgundy-deep transition-all duration-300 hover:shadow-[0_8px_32px_-8px_rgba(91,14,20,0.4)]"
            >
              Sign In
            </button>
            <p className="mt-4 text-sm text-wine/50">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => openAuthModal('signup')}
                className="text-burgundy underline underline-offset-2 hover:text-burgundy-light transition-colors"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // --------------------------------------------------
  // Authenticated dashboard
  // --------------------------------------------------
  const tierInfo = LOYALTY_TIERS[user.tier]
  const nextTierKey = user.tier === 'thread' ? 'stitch' : user.tier === 'stitch' ? 'weave' : user.tier === 'weave' ? 'tapestry' : null
  const nextTier = nextTierKey ? LOYALTY_TIERS[nextTierKey] : null
  const progressToNext = nextTier
    ? Math.min(((user.points - tierInfo.min) / (nextTier.min - tierInfo.min)) * 100, 100)
    : 100

  return (
    <div className="pt-24 pb-32 bg-ivory min-h-screen">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ═══════════════════════════════════════════
            HEADER — Greeting & Tier Info
           ═══════════════════════════════════════════ */}
        <div className="mb-12 lg:mb-16">
          <p className="text-xs font-semibold text-gold-muted uppercase tracking-[0.3em] mb-3">
            My Account
          </p>
          <TextReveal
            as="h1"
            className="text-4xl sm:text-5xl lg:text-6xl text-burgundy mb-4"
          >
            {`Welcome, ${user.name.split(' ')[0]}`}
          </TextReveal>
          <FadeIn delay={0.15}>
            <p className="text-wine/70 max-w-xl">
              Manage your orders, wishlist, and rewards all in one place.
            </p>
          </FadeIn>
        </div>

        {/* ═══════════════════════════════════════════
            TIER & POINTS BANNER
           ═══════════════════════════════════════════ */}
        <FadeIn delay={0.2}>
          <div className="relative mb-12 p-6 sm:p-8 bg-burgundy-deep overflow-hidden">
            <div className="knit-pattern-gold absolute inset-0" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              {/* Left: Tier badge + points */}
              <div className="flex items-center gap-4">
                <div className={`px-4 py-1.5 text-xs font-bold tracking-widest uppercase ${tierColors[user.tier]}`}>
                  {tierInfo.name}
                </div>
                <div>
                  <p className="text-gold text-2xl font-heading font-bold">
                    {user.points.toLocaleString()}
                  </p>
                  <p className="text-silk/60 text-xs tracking-wide uppercase">
                    Reward Points
                  </p>
                </div>
              </div>

              {/* Right: Progress to next tier */}
              {nextTier && (
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-xs text-silk/60 mb-2">
                    <span>{tierInfo.name}</span>
                    <span>{nextTier.min - user.points} pts to {nextTierKey && LOYALTY_TIERS[nextTierKey].name}</span>
                  </div>
                  <div className="w-full h-1.5 bg-burgundy rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold transition-all duration-700 ease-[var(--ease-yarn-pull)] rounded-full"
                      style={{ width: `${progressToNext}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Tier perks note */}
              <p className="text-xs text-silk/50 sm:text-right">
                {tierInfo.discount}% member discount
              </p>
            </div>
          </div>
        </FadeIn>

        {/* ═══════════════════════════════════════════
            QUICK LINKS GRID
            Glass-morphism cards with hover tilt
           ═══════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mb-16">
          {quickLinks.map((link, i) => (
            <FadeIn key={link.title} delay={0.1 + i * 0.08}>
              <QuickLinkCard {...link} />
            </FadeIn>
          ))}
        </div>

        {/* ═══════════════════════════════════════════
            USER INFO & LOGOUT
           ═══════════════════════════════════════════ */}
        <FadeIn delay={0.5}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 border-t border-gold-muted/20">
            <div>
              <p className="text-sm text-wine/70">
                Signed in as <span className="font-semibold text-burgundy">{user.email}</span>
              </p>
              <p className="text-xs text-wine/50 mt-1">
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold tracking-wider uppercase border border-burgundy/20 text-burgundy hover:bg-burgundy hover:text-gold transition-all duration-300"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="16,17 21,12 16,7" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign Out
            </button>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────
   QUICK LINK CARD
   Glass-morphism with CSS perspective tilt on hover
   ────────────────────────────────────────────────────────── */

function QuickLinkCard({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: React.ReactNode
}) {
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`
  }, [])

  const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) translateY(0px)'
  }, [])

  return (
    <Link
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative block p-6 lg:p-8 glass border border-gold-muted/20 transition-all duration-500 ease-[var(--ease-yarn-pull)] hover:shadow-[0_12px_40px_-12px_rgba(91,14,20,0.12)]"
      style={{ willChange: 'transform' }}
    >
      {/* Top-left gold accent */}
      <div className="absolute top-0 left-0 w-8 h-0.5 bg-gold transition-all duration-500 group-hover:w-14" />
      <div className="absolute top-0 left-0 w-0.5 h-8 bg-gold transition-all duration-500 group-hover:h-14" />

      <div className="mb-4 text-burgundy transition-colors duration-300 group-hover:text-wine">
        {icon}
      </div>

      <h3 className="font-heading text-lg text-burgundy mb-1 group-hover:text-burgundy-light transition-colors duration-300">
        {title}
      </h3>
      <p className="text-xs text-wine/60 leading-relaxed">
        {description}
      </p>

      {/* Arrow hint */}
      <div className="absolute bottom-6 right-6 opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </Link>
  )
}
