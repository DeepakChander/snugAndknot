'use client'

import { create } from 'zustand'
import type { Toast } from '@/types'

interface UIStore {
  isMenuOpen: boolean
  isSearchOpen: boolean
  isPreloaderDone: boolean
  toasts: Toast[]
  cursorLabel: string
  openMenu: () => void
  closeMenu: () => void
  toggleMenu: () => void
  openSearch: () => void
  closeSearch: () => void
  setPreloaderDone: () => void
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
  setCursorLabel: (label: string) => void
  clearCursorLabel: () => void
}

export const useUIStore = create<UIStore>((set, get) => ({
  isMenuOpen: false,
  isSearchOpen: false,
  isPreloaderDone: false,
  toasts: [],
  cursorLabel: '',

  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
  toggleMenu: () => set({ isMenuOpen: !get().isMenuOpen }),

  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),

  setPreloaderDone: () => set({ isPreloaderDone: true }),

  addToast: (message, type = 'success') => {
    const id = `toast-${Date.now()}`
    set({ toasts: [...get().toasts, { id, message, type }] })
    setTimeout(() => get().removeToast(id), 3000)
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) })
  },

  setCursorLabel: (label) => set({ cursorLabel: label }),
  clearCursorLabel: () => set({ cursorLabel: '' }),
}))
