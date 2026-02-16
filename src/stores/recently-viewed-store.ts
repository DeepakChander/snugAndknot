'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RecentlyViewedStore {
  handles: string[]
  addHandle: (handle: string) => void
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set, get) => ({
      handles: [],

      addHandle: (handle) => {
        const current = get().handles.filter((h) => h !== handle)
        set({ handles: [handle, ...current].slice(0, 10) })
      },
    }),
    { name: 'snug-knot-recently-viewed' }
  )
)
