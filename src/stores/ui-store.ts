'use client'

import { create } from 'zustand'
import type { Toast } from '@/types'
import { lockScroll, unlockScroll } from '@/lib/motion/lenis'

export type CursorVariant = 'default' | 'hover' | 'view' | 'drag' | 'hidden' | 'text'

interface UIStore {
  isMenuOpen: boolean
  isSearchOpen: boolean
  isHelpOpen: boolean
  toasts: (Toast & { action?: { label: string; href: string } })[]
  cursor: { variant: CursorVariant; label: string }
  openMenu: () => void
  closeMenu: () => void
  toggleMenu: () => void
  openSearch: () => void
  closeSearch: () => void
  setHelpOpen: (open: boolean) => void
  addToast: (message: string, type?: Toast['type'], action?: { label: string; href: string }) => void
  removeToast: (id: string) => void
  setCursor: (variant: CursorVariant, label?: string) => void
  /** Legacy hooks used by older components; now backed by the shared scroll lock. */
  lenisStop: (() => void) | null
  lenisStart: (() => void) | null
  setLenisControls: (stop: () => void, start: () => void) => void
}

let toastSeq = 0

export const useUIStore = create<UIStore>((set, get) => ({
  isMenuOpen: false,
  isSearchOpen: false,
  isHelpOpen: false,
  toasts: [],
  cursor: { variant: 'default', label: '' },

  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
  toggleMenu: () => set({ isMenuOpen: !get().isMenuOpen }),
  openSearch: () => set({ isSearchOpen: true, isMenuOpen: false }),
  closeSearch: () => set({ isSearchOpen: false }),
  setHelpOpen: (open) => set({ isHelpOpen: open }),

  addToast: (message, type = 'success', action) => {
    const id = `toast-${Date.now()}-${toastSeq++}`
    set({ toasts: [...get().toasts.slice(-3), { id, message, type, action }] })
    setTimeout(() => get().removeToast(id), action ? 5000 : 3600)
  },
  removeToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  setCursor: (variant, label = '') => {
    const c = get().cursor
    if (c.variant !== variant || c.label !== label) set({ cursor: { variant, label } })
  },

  lenisStop: lockScroll,
  lenisStart: unlockScroll,
  setLenisControls: () => {},
}))
