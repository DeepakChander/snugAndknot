'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react'
import { formatMoney } from '@/lib/format'
import { DEFAULT_SETTINGS } from '@/lib/settings-defaults'
import { baseCurrency, currencies, currencyForCountry, findCurrency, productPriceIn, variantPriceIn, type ResolvedCurrency } from '@/lib/currency'
import type { Category, Collection, CurrencyPrice, PriceBook, Product, SiteSettings } from '@/types/commerce'

/** Settings the storefront may see (everything admin-editable is public by design). */
export type PublicSettings = Pick<SiteSettings, 'store' | 'commerce' | 'announcement' | 'homepage' | 'reviews'>

export interface NavData {
  collections: Pick<Collection, 'handle' | 'title' | 'subtitle' | 'image'>[]
  /** Categories with active pieces, in admin order. */
  categories: Pick<Category, 'slug' | 'title' | 'image' | 'department' | 'group' | 'showInMenu'>[]
  spotlight: Pick<Product, 'handle' | 'title' | 'price' | 'compareAtPrice' | 'prices' | 'images' | 'productType'>[]
  /** Active pieces per department, and a photograph of one of them for the menu. */
  departments: Record<'men' | 'women' | 'kids', { count: number; image: string }>
}

interface Ctx {
  settings: PublicSettings
  nav: NavData
}

const SettingsContext = createContext<Ctx>({
  settings: DEFAULT_SETTINGS,
  nav: { collections: [], categories: [], spotlight: [], departments: { men: { count: 0, image: '' }, women: { count: 0, image: '' }, kids: { count: 0, image: '' } } },
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

/* ─────────────────────────── Currency ─────────────────────────── */

/** `sk_currency`: the shopper's own choice. `sk_country`: where they are (from /api/geo). Not personal data. */
const CHOICE = 'sk_currency'
const COUNTRY = 'sk_country'
const listeners = new Set<() => void>()
const readCookie = (name: string) => document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))?.[1] ?? ''
const writeCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; Path=/; Max-Age=31536000; SameSite=Lax`
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const clientSnapshot = () => `${readCookie(CHOICE)}|${readCookie(COUNTRY)}`
const serverSnapshot = () => null

interface CurrencyCtx {
  currency: ResolvedCurrency
  all: ResolvedCurrency[]
  setCurrency: (code: string) => void
}
const CurrencyContext = createContext<CurrencyCtx | null>(null)

/**
 * The shopper's currency on the storefront: their own choice, else the one for their country, else
 * the base currency. With no additional currencies this is always the base currency and nothing is
 * fetched. Outside this provider (the admin) everything is in the base currency.
 */
export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { commerce } = useSettings()
  const snap = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const all = useMemo(() => currencies(commerce), [commerce])
  const multi = all.length > 1
  const [choice, country] = (snap ?? '|').split('|')
  const currency = (multi && (findCurrency(commerce, choice) ?? (country ? currencyForCountry(commerce, country) : null))) || all[0]

  useEffect(() => {
    if (!multi || snap === null || country) return
    // First visit: ask where the shopper is once (the answer is kept in a cookie by the route).
    fetch('/api/geo', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d: { country?: string }) => writeCookie(COUNTRY, /^[A-Z]{2}$/.test(d.country ?? '') ? d.country! : 'ZZ'))
      .catch(() => writeCookie(COUNTRY, 'ZZ'))
  }, [multi, snap, country])

  // Prices hidden by the inline script in the store layout (see CurrencyBootScript) show again.
  const resolved = !multi || (snap !== null && (!!findCurrency(commerce, choice) || !!country))
  useEffect(() => {
    if (resolved) document.documentElement.classList.remove('sk-currency-pending')
  }, [resolved])

  const value = useMemo<CurrencyCtx>(() => ({ currency, all, setCurrency: (code) => writeCookie(CHOICE, code) }), [currency, all])
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyCtx {
  const ctx = useContext(CurrencyContext)
  const { commerce } = useSettings()
  return useMemo(() => ctx ?? { currency: baseCurrency(commerce), all: currencies(commerce), setCurrency: () => {} }, [ctx, commerce])
}

/**
 * Money formatter. With no argument it formats in the shopper's currency (storefront) or the base
 * currency (admin). Pass a currency to format an order's or a quote's amounts in their own currency;
 * a per-call `currency` option does the same for lists that mix currencies.
 */
export function useMoney(fixed?: string | null) {
  const { commerce } = useSettings()
  const { currency } = useCurrency()
  return useCallback(
    (amount: number, opts?: { cents?: boolean; currency?: string | null }) => {
      const code = opts?.currency ?? fixed ?? currency.code
      return formatMoney(amount, code, findCurrency(commerce, code)?.locale ?? commerce.locale, opts)
    },
    [commerce, currency.code, fixed]
  )
}

type Priced = { price: number; compareAtPrice: number | null; prices?: PriceBook }

/** A product's price in the shopper's currency; null when it is not sold in it yet. */
export function useProductPrice() {
  const { currency } = useCurrency()
  return useCallback((product: Priced): CurrencyPrice | null => productPriceIn(product, currency), [currency])
}

/** A variant's price in the shopper's currency; null when it is not sold in it yet. */
export function useVariantPrice() {
  const { currency } = useCurrency()
  return useCallback((product: Priced, variant: Priced): CurrencyPrice | null => variantPriceIn(product, variant, currency), [currency])
}
