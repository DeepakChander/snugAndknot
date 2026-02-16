'use client'

import { create } from 'zustand'
import type { Toast } from '@/types'

interface UIStore {
  isMenuOpen: boolean
  isSearchOpen: boolean
  toasts: Toast[]
  openMenu: () => void
  closeMenu: () => void
  toggleMenu: () => void
  openSearch: () => void
  closeSearch: () => void
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
  // Lenis smooth scroll controls (set by SmoothScroll provider)
  lenisStop: (() => void) | null
  lenisStart: (() => void) | null
  setLenisControls: (stop: () => void, start: () => void) => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  isMenuOpen: false,
  isSearchOpen: false,
  toasts: [],

  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
  toggleMenu: () => set({ isMenuOpen: !get().isMenuOpen }),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  addToast: (message, type = 'success') => {
    const id = `toast-${Date.now()}`
    set({ toasts: [...get().toasts, { id, message, type }] })
    setTimeout(() => get().removeToast(id), 3000)
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },

  // Lenis smooth scroll controls
  lenisStop: null,
  lenisStart: null,
  setLenisControls: (stop, start) => set({ lenisStop: stop, lenisStart: start }),
}))
