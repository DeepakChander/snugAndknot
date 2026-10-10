'use client'

import { createContext, useCallback, useContext, useMemo } from 'react'
import { formatMoney } from '@/lib/format'
import { DEFAULT_SETTINGS } from '@/lib/settings-defaults'
import type { Category, Collection, Product, SiteSettings } from '@/types/commerce'

/** Settings the storefront may see (everything admin-editable is public by design). */
export type PublicSettings = Pick<SiteSettings, 'store' | 'commerce' | 'announcement' | 'homepage' | 'reviews'>

export interface NavData {
  collections: Pick<Collection, 'handle' | 'title' | 'subtitle' | 'image'>[]
  categories: Pick<Category, 'slug' | 'title' | 'image'>[]
  spotlight: Pick<Product, 'handle' | 'title' | 'price' | 'images' | 'productType'>[]
  genders: { men: number; women: number; kids: number }
}

interface Ctx {
  settings: PublicSettings
  nav: NavData
}

const SettingsContext = createContext<Ctx>({
  settings: DEFAULT_SETTINGS,
  nav: { collections: [], categories: [], spotlight: [], genders: { men: 0, women: 0, kids: 0 } },
})

export function SettingsProvider({ settings, nav, children }: Ctx & { children: React.ReactNode }) {
  const value = useMemo(() => ({ settings, nav }), [settings, nav])
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  return useContext(SettingsContext).settings
}

export function useNavData() {
  return useContext(SettingsContext).nav
}

/** Money formatter bound to the store's configured currency and locale. */
export function useMoney() {
  const { commerce } = useSettings()
  return useCallback(
    (amount: number, opts?: { cents?: boolean }) => formatMoney(amount, commerce.currency, commerce.locale, opts),
    [commerce.currency, commerce.locale]
  )
}
