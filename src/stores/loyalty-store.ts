'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LoyaltyActivity } from '@/types'

interface LoyaltyStore {
  activities: LoyaltyActivity[]
  addActivity: (activity: Omit<LoyaltyActivity, 'id' | 'date'>) => void
}

export const useLoyaltyStore = create<LoyaltyStore>()(
  persist(
    (set, get) => ({
      activities: [
        { id: 'act-1', type: 'purchase', description: 'Ivory Cable Knit Cardigan', points: 189, date: '2026-02-14' },
        { id: 'act-2', type: 'review', description: 'Product review submitted', points: 50, date: '2026-02-10' },
        { id: 'act-3', type: 'purchase', description: 'Noir & Crimson Knit Tee', points: 129, date: '2026-01-28' },
        { id: 'act-4', type: 'referral', description: 'Friend referral bonus', points: 200, date: '2026-01-15' },
        { id: 'act-5', type: 'redemption', description: 'Redeemed 500pts discount', points: -500, date: '2026-01-10' },
      ],

      addActivity: (activity) => {
        const newActivity: LoyaltyActivity = {
          ...activity,
          id: `act-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
        }
        set({ activities: [newActivity, ...get().activities] })
      },
    }),
    { name: 'snug-knot-loyalty' }
  )
)
