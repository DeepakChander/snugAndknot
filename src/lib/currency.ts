import type { CommerceSettings, Coupon, CurrencyPrice, CurrencySettings, PriceBook } from '@/types/commerce'

/**
 * The shop's currencies: the base currency (the commerce settings themselves) plus any additional
 * ones, each priced separately by the owner. Shared by the server and the browser; no side effects.
 */

export interface ResolvedCurrency extends CurrencySettings {
  base: boolean
}

export function baseCurrency(commerce: CommerceSettings): ResolvedCurrency {
  return {
    code: commerce.currency.toUpperCase(),
    locale: commerce.locale,
    freeShippingThreshold: commerce.freeShippingThreshold,
    standardShippingRate: commerce.standardShippingRate,
    expressShippingRate: commerce.expressShippingRate,
    pointsPerUnit: commerce.pointsPerDollar,
    countries: [],
    base: true,
  }
}

export function currencies(commerce: CommerceSettings): ResolvedCurrency[] {
  const base = baseCurrency(commerce)
  const extra = (commerce.extraCurrencies ?? [])
    .filter((c) => c.code && c.code.toUpperCase() !== base.code)
    .map((c) => ({ ...c, code: c.code.toUpperCase(), base: false }))
  return [base, ...extra]
}

/** The settings for `code`, or null if the shop does not sell in it. */
export function findCurrency(commerce: CommerceSettings, code: string | null | undefined): ResolvedCurrency | null {
  if (!code) return null
  const upper = code.toUpperCase()
  return currencies(commerce).find((c) => c.code === upper) ?? null
}

/** The currency shoppers from `country` (ISO 3166 alpha-2) see first; the base currency otherwise. */
export function currencyForCountry(commerce: CommerceSettings, country: string | null | undefined): ResolvedCurrency {
  const upper = country?.toUpperCase()
  return (upper && currencies(commerce).find((c) => !c.base && c.countries.some((x) => x.toUpperCase() === upper))) || baseCurrency(commerce)
}

interface Priced {
  price: number
  compareAtPrice: number | null
  prices?: PriceBook
}

/**
 * A variant's price in `currency`. The base currency uses the variant's own price; an additional
 * currency uses the variant's override, else the product's price in it. Null: not sold in it.
 */
export function variantPriceIn(product: Priced, variant: Priced, currency: ResolvedCurrency): CurrencyPrice | null {
  if (currency.base) return { price: variant.price, compareAtPrice: variant.compareAtPrice }
  return variant.prices?.[currency.code] ?? product.prices?.[currency.code] ?? null
}

/** A product's headline price in `currency` (lists and cards). Null: not sold in it. */
export function productPriceIn(product: Priced, currency: ResolvedCurrency): CurrencyPrice | null {
  if (currency.base) return { price: product.price, compareAtPrice: product.compareAtPrice }
  return product.prices?.[currency.code] ?? null
}

/** A coupon's terms in `currency`, or null when it cannot be used in it. */
export function couponIn(coupon: Coupon, currency: ResolvedCurrency): { type: Coupon['type']; value: number; minPurchase: number } | null {
  if (currency.base) return { type: coupon.type, value: coupon.value, minPurchase: coupon.minPurchase }
  const a = coupon.amounts?.[currency.code]
  if (coupon.type === 'fixed') return a?.value ? { type: 'fixed', value: a.value, minPurchase: a.minPurchase ?? 0 } : null
  // A percentage works in any currency; a minimum spend set only in the base currency must be restated.
  if (a) return { type: 'percentage', value: coupon.value, minPurchase: a.minPurchase ?? 0 }
  return coupon.minPurchase > 0 ? null : { type: 'percentage', value: coupon.value, minPurchase: 0 }
}

/** "₹", "$", "€" … for a currency, falling back to its code. */
export function currencySymbol(code: string, locale = 'en'): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' }).formatToParts(0).find((p) => p.type === 'currency')?.value ?? code
  } catch {
    return code
  }
}
