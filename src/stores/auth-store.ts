'use client'

import { create } from 'zustand'
import { api, ApiError } from '@/lib/api'
import type { PublicUser } from '@/types/commerce'

type AuthMode = 'login' | 'signup' | 'forgot-password'

interface AuthStore {
  user: PublicUser | null
  /** 'idle' until the first /api/auth/me check finishes. */
  status: 'idle' | 'loading' | 'ready'
  isAuthenticated: boolean
  isAuthModalOpen: boolean
  authMode: AuthMode
  error: string | null
  fieldErrors: Record<string, string>
  /** Runs after a successful sign-in from the modal (e.g. "write a review"). */
  afterAuth: (() => void) | null
  fetchSession: () => Promise<void>
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  setUser: (user: PublicUser | null) => void
  openAuthModal: (mode?: 'login' | 'signup', afterAuth?: () => void) => void
  closeAuthModal: () => void
  setAuthMode: (mode: AuthMode) => void
  clearErrors: () => void
  /** Legacy: points are now earned server-side; refresh the session instead. */
  updatePoints: (points: number) => void
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  status: 'idle',
  isAuthenticated: false,
  isAuthModalOpen: false,
  authMode: 'login',
  error: null,
  fieldErrors: {},
  afterAuth: null,

  fetchSession: async () => {
    if (get().status === 'loading') return
    set({ status: 'loading' })
    try {
      const { user } = await api<{ user: PublicUser | null }>('/api/auth/me')
      set({ user, isAuthenticated: !!user, status: 'ready' })
    } catch {
      set({ status: 'ready' })
    }
  },

  login: async (email, password) => {
    set({ error: null, fieldErrors: {} })
    try {
      const { user } = await api<{ user: PublicUser }>('/api/auth/login', { body: { email, password } })
      const after = get().afterAuth
      set({ user, isAuthenticated: true, isAuthModalOpen: false, afterAuth: null, status: 'ready' })
      after?.()
      return true
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Sign-in failed.', fieldErrors: err instanceof ApiError ? err.fields ?? {} : {} })
      return false
    }
  },

  signup: async (name, email, password) => {
    set({ error: null, fieldErrors: {} })
    try {
      const { user } = await api<{ user: PublicUser }>('/api/auth/signup', { body: { name, email, password } })
      const after = get().afterAuth
      set({ user, isAuthenticated: true, isAuthModalOpen: false, afterAuth: null, status: 'ready' })
      after?.()
      return true
    } catch (err) {
      set({ error: err instanceof ApiError ? err.message : 'Could not create your account.', fieldErrors: err instanceof ApiError ? err.fields ?? {} : {} })
      return false
    }
  },

  logout: async () => {
    await api('/api/auth/logout', { method: 'POST' }).catch(() => {})
    set({ user: null, isAuthenticated: false })
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  openAuthModal: (mode = 'login', afterAuth) =>
    set({ isAuthModalOpen: true, authMode: mode, error: null, fieldErrors: {}, afterAuth: afterAuth ?? null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, afterAuth: null }),
  setAuthMode: (mode) => set({ authMode: mode, error: null, fieldErrors: {} }),
  clearErrors: () => set({ error: null, fieldErrors: {} }),
  updatePoints: () => {
    void get().fetchSession()
  },
}))
