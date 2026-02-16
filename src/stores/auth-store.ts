'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isAuthModalOpen: boolean
  authMode: 'login' | 'signup' | 'forgot-password'
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  openAuthModal: (mode?: 'login' | 'signup') => void
  closeAuthModal: () => void
  setAuthMode: (mode: 'login' | 'signup' | 'forgot-password') => void
  updatePoints: (points: number) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAuthModalOpen: false,
      authMode: 'login',

      login: async (email, _password) => {
        // Mock authentication — ready for Shopify Customer API
        await new Promise((r) => setTimeout(r, 800))
        const user: User = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          email,
          tier: 'stitch',
          points: 1247,
          createdAt: new Date().toISOString(),
        }
        set({ user, isAuthenticated: true, isAuthModalOpen: false })
        return true
      },

      signup: async (name, email, _password) => {
        await new Promise((r) => setTimeout(r, 1000))
        const user: User = {
          id: `user-${Date.now()}`,
          name,
          email,
          tier: 'thread',
          points: 100, // Welcome bonus
          createdAt: new Date().toISOString(),
        }
        set({ user, isAuthenticated: true, isAuthModalOpen: false })
        return true
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      openAuthModal: (mode = 'login') => {
        set({ isAuthModalOpen: true, authMode: mode })
      },

      closeAuthModal: () => {
        set({ isAuthModalOpen: false })
      },

      setAuthMode: (mode) => {
        set({ authMode: mode })
      },

      updatePoints: (points) => {
        const user = get().user
        if (user) {
          const newPoints = user.points + points
          let tier: User['tier'] = 'thread'
          if (newPoints >= 3000) tier = 'tapestry'
          else if (newPoints >= 1500) tier = 'weave'
          else if (newPoints >= 500) tier = 'stitch'
          set({ user: { ...user, points: newPoints, tier } })
        }
      },
    }),
    {
      name: 'snug-knot-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
