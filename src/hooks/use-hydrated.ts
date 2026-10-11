'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/** false during SSR and the hydration render, true afterwards — gate localStorage-backed UI on it. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
