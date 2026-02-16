'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { useLoyaltyStore } from '@/stores/loyalty-store'
import { LOYALTY_TIERS, type LoyaltyTier } from '@/types'
import FadeIn from '@/components/animation/FadeIn'
import TextReveal from '@/components/animation/TextReveal'

/* ------------------------------------------------
   Earning methods data
   ------------------------------------------------ */
const earningMethods = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    title: 'Purchase',
    description: 'Earn on every order',
    points: '+10 pts / $1',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: 'Review',
    description: 'Share your thoughts',
    points: '+50 pts',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v-2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: 'Referral',
    description: 'Invite a friend',
    points: '+200 pts',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-7 h-7">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M12 14l-2 2 2 2" />
      </svg>
    ),
    title: 'Birthday',
    description: 'Annual birthday gift',
    points: '+100 pts',
  },
]

/* ------------------------------------------------
   Tier ordering for "next tier" calculation
   ------------------------------------------------ */
const tierOrder: LoyaltyTier[] = ['thread', 'stitch', 'weave', 'tapestry']

function getNextTier(current: LoyaltyTier) {
  const idx = tierOrder.indexOf(current)
  if (idx === -1 || idx >= tierOrder.length - 1) return null
  return tierOrder[idx + 1]
}

/* ------------------------------------------------
   Component
   ------------------------------------------------ */
export default function RewardsPage() {
  const { user, isAuthenticated, openAuthModal } = useAuthStore()
  const { activities } = useLoyaltyStore()

  /* ---- Tier progress calculation ---- */
  const tierProgress = useMemo(() => {
    if (!user) return { percent: 0, pointsToNext: 0, nextTierName: '' }
    const currentTierData = LOYALTY_TIERS[user.tier]
    const nextTierKey = getNextTier(user.tier)

    if (!nextTierKey) {
      // Already at highest tier
      return { percent: 100, pointsToNext: 0, nextTierName: '' }
    }

    const nextTierData = LOYALTY_TIERS[nextTierKey]
    const rangeStart = currentTierData.min
    const rangeEnd = nextTierData.min
    const progress = Math.min(
      ((user.points - rangeStart) / (rangeEnd - rangeStart)) * 100,
      100
    )
    const pointsToNext = Math.max(rangeEnd - user.points, 0)

    return {
      percent: Math.round(progress),
      pointsToNext,
      nextTierName: nextTierData.name,
    }
  }, [user])

  /* ---- Not authenticated CTA ---- */
  if (!isAuthenticated || !user) {
    return (
      <main className="page-content min-h-screen bg-ivory">
        <div className="max-w-2xl mx-auto px-5 py-24 text-center">
          <FadeIn>
            <div className="glass rounded-2xl border border-burgundy/8 p-12">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-burgundy">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <h1 className="font-heading text-3xl text-burgundy mb-3">
                Join Snug&Knot Rewards
              </h1>
              <p className="text-burgundy/60 mb-8 max-w-md mx-auto">
                Sign in to start earning points on every purchase, unlock exclusive tiers, and enjoy member-only perks.
              </p>
              <button
                onClick={() => openAuthModal('login')}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-burgundy text-gold rounded-full font-medium text-sm tracking-wide hover:bg-burgundy-deep transition-colors duration-300"
              >
                Sign In to Get Started
              </button>
            </div>
          </FadeIn>
        </div>
      </main>
    )
  }

  /* ---- Authenticated rewards dashboard ---- */
  return (
    <main className="page-content min-h-screen bg-ivory">
      <div className="max-w-5xl mx-auto px-5 lg:px-10 py-16 lg:py-24">

        {/* ---- Page Heading ---- */}
        <div className="mb-12">
          <TextReveal as="h1" className="font-heading text-4xl lg:text-5xl text-burgundy mb-2">
            Your Rewards
          </TextReveal>
          <FadeIn delay={0.2}>
            <p className="text-burgundy/60 text-lg">
              Welcome back, {user.name}. Keep earning to unlock more perks.
            </p>
          </FadeIn>
        </div>

        {/* ---- Tier Status Card ---- */}
        <FadeIn delay={0.1}>
          <div className="glass rounded-2xl border border-burgundy/8 p-8 lg:p-10 mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <p className="text-sm uppercase tracking-wider text-burgundy/50 mb-1">
                  Current Tier
                </p>
                <h2 className="font-heading text-3xl text-burgundy">
                  {LOYALTY_TIERS[user.tier].name}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm uppercase tracking-wider text-burgundy/50 mb-1">
                  Total Points
                </p>
                <p className="font-heading text-3xl text-gold-muted">
                  {user.points.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-burgundy/8 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-gold-muted to-gold transition-all duration-700 ease-[var(--ease-loom-settle)]"
                style={{ width: `${tierProgress.percent}%` }}
              />
            </div>

            {/* Points to next tier */}
            {tierProgress.nextTierName ? (
              <p className="mt-3 text-sm text-burgundy/60">
                <span className="font-semibold text-burgundy">
                  {tierProgress.pointsToNext.toLocaleString()} points
                </span>{' '}
                to{' '}
                <span className="font-semibold text-gold-muted">
                  {tierProgress.nextTierName}
                </span>
              </p>
            ) : (
              <p className="mt-3 text-sm text-gold-muted font-medium">
                You have reached the highest tier. Enjoy all exclusive benefits!
              </p>
            )}

            {/* Tier discount badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-burgundy/5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-gold" />
              <span className="text-sm text-burgundy/70">
                {LOYALTY_TIERS[user.tier].discount}% member discount active
              </span>
            </div>
          </div>
        </FadeIn>

        {/* ---- Earning Methods ---- */}
        <FadeIn delay={0.2}>
          <h2 className="font-heading text-2xl text-burgundy mb-6">
            Ways to Earn
          </h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {earningMethods.map((method, i) => (
            <FadeIn key={method.title} delay={0.25 + i * 0.08}>
              <div className="glass rounded-xl border border-burgundy/8 p-6 text-center hover:border-gold/40 transition-colors duration-300 h-full">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gold/15 flex items-center justify-center text-burgundy">
                  {method.icon}
                </div>
                <h3 className="font-heading text-lg text-burgundy mb-1">
                  {method.title}
                </h3>
                <p className="text-sm text-burgundy/50 mb-3">
                  {method.description}
                </p>
                <p className="font-mono text-sm font-semibold text-gold-muted">
                  {method.points}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* ---- Recent Activity ---- */}
        <FadeIn delay={0.3}>
          <h2 className="font-heading text-2xl text-burgundy mb-6">
            Recent Activity
          </h2>
        </FadeIn>

        <FadeIn delay={0.35}>
          <div className="glass rounded-2xl border border-burgundy/8 overflow-hidden">
            {activities.length === 0 ? (
              <div className="p-10 text-center text-burgundy/40">
                No activity yet. Make a purchase to start earning!
              </div>
            ) : (
              <ul className="divide-y divide-burgundy/6">
                {activities.map((activity, i) => (
                  <li
                    key={activity.id}
                    className="flex items-center justify-between px-6 py-4 hover:bg-burgundy/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Activity type icon */}
                      <div className="w-10 h-10 rounded-full bg-burgundy/5 flex items-center justify-center flex-shrink-0">
                        {activity.type === 'purchase' && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-burgundy/60">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <path d="M16 10a4 4 0 01-8 0" />
                          </svg>
                        )}
                        {activity.type === 'review' && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-burgundy/60">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        )}
                        {activity.type === 'referral' && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-burgundy/60">
                            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v-2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 00-3-3.87" />
                            <path d="M16 3.13a4 4 0 010 7.75" />
                          </svg>
                        )}
                        {activity.type === 'birthday' && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-burgundy/60">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        )}
                        {activity.type === 'redemption' && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5 text-burgundy/60">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                            <line x1="7" y1="7" x2="7.01" y2="7" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-burgundy">
                          {activity.description}
                        </p>
                        <p className="text-xs text-burgundy/40 mt-0.5">
                          {new Date(activity.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-mono text-sm font-semibold ${
                        activity.points >= 0
                          ? 'text-success-moss'
                          : 'text-error-garnet'
                      }`}
                    >
                      {activity.points >= 0 ? '+' : ''}
                      {activity.points}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </FadeIn>

        {/* ---- Back link ---- */}
        <FadeIn delay={0.4}>
          <div className="mt-10">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-sm text-burgundy/50 hover:text-burgundy transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Account
            </Link>
          </div>
        </FadeIn>
      </div>
    </main>
  )
}
