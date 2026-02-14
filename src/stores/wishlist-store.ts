'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistStore {
  items: string[] // product handles
  addItem: (handle: string) => void
  removeItem: (handle: string) => void
  toggleItem: (handle: string) => void
  hasItem: (handle: string) => boolean
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (handle) => {
        if (!get().items.includes(handle)) {
          set({ items: [...get().items, handle] })
        }
      },

      removeItem: (handle) => {
        set({ items: get().items.filter((h) => h !== handle) })
      },

      toggleItem: (handle) => {
        if (get().items.includes(handle)) {
          get().removeItem(handle)
        } else {
          get().addItem(handle)
        }
      },

      hasItem: (handle) => get().items.includes(handle),
    }),
    {
      name: 'snug-knot-wishlist',
    }
  )
)
