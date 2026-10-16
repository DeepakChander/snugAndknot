import 'server-only'
import { tx, type Queryable } from '@/server/db/client'
import { mergeSettings, DEFAULT_SETTINGS } from '@/lib/settings-defaults'
import type { CommerceSettings, CurrencySettings, PriceBook } from '@/types/commerce'
import { converter, convertPrice, type Rounding } from '@/lib/currency-convert'

export type { Rounding }

/**
 * Changes the shop's main (base) currency, e.g. USD → INR. Every amount kept in the base currency
 * (product and size prices, coupon amounts, shipping thresholds and rates, points) moves to the new
 * one: an amount the owner already set in that currency is used as it is; anything else is the old
 * amount × `rate`, rounded. The old currency stays on as an additional currency with exactly its old
 * amounts, so nothing is lost and shoppers who chose it keep it. Orders keep the currency they were
 * paid in. All in one transaction.
 */

export interface SwitchInput {
  code: string
  /** How many of the new currency one unit of the old one is worth (1 USD = 84 INR → 84). */
  rate: number
  rounding: Rounding
}

export interface SwitchResult {
  from: string
  to: string
  products: number
  variants: number
  coupons: number
}

const LOCALES: Record<string, string> = { INR: 'en-IN', USD: 'en-US', EUR: 'en-IE', GBP: 'en-GB', AED: 'en-AE', SGD: 'en-SG', AUD: 'en-AU', CAD: 'en-CA' }

/** The price book after the switch: the new currency leaves it (it is the base now), the old one joins. */
export function swapBook(book: PriceBook, from: string, to: string, oldPrice: number, oldCompareAt: number | null): PriceBook {
  const next: PriceBook = { ...book }
  delete next[to]
  next[from] = { price: oldPrice, compareAtPrice: oldCompareAt }
  return next
}

export function switchCommerce(commerce: CommerceSettings, input: SwitchInput): CommerceSettings {
  const from = commerce.currency.toUpperCase()
  const to = input.code.toUpperCase()
  const conv = converter(input.rate, input.rounding)
  const existing = (commerce.extraCurrencies ?? []).find((c) => c.code.toUpperCase() === to)
  const oldAsExtra: CurrencySettings = {
    code: from,
    locale: commerce.locale,
    freeShippingThreshold: commerce.freeShippingThreshold,
    standardShippingRate: commerce.standardShippingRate,
    expressShippingRate: commerce.expressShippingRate,
    pointsPerUnit: commerce.pointsPerDollar,
    countries: [],
  }
  return {
    ...commerce,
    currency: to,
    locale: existing?.locale || LOCALES[to] || commerce.locale,
    freeShippingThreshold: existing ? existing.freeShippingThreshold : conv(commerce.freeShippingThreshold),
    standardShippingRate: existing ? existing.standardShippingRate : conv(commerce.standardShippingRate),
    expressShippingRate: existing ? existing.expressShippingRate : conv(commerce.expressShippingRate),
    // Points per unit spent: the same points for the same value (1 per $1 → 1 per ₹84 at 84).
    pointsPerDollar: existing ? existing.pointsPerUnit : Math.round((commerce.pointsPerDollar / input.rate) * 10_000) / 10_000,
    extraCurrencies: [...(commerce.extraCurrencies ?? []).filter((c) => c.code.toUpperCase() !== to), oldAsExtra],
  }
}

async function switchIn(q: Queryable, input: SwitchInput): Promise<SwitchResult> {
  const [row] = await q.query<{ value: unknown }>(`SELECT value FROM settings WHERE key = 'commerce' FOR UPDATE`)
  const commerce = mergeSettings(DEFAULT_SETTINGS.commerce, row?.value)
  const from = commerce.currency.toUpperCase()
  const to = input.code.toUpperCase()
  if (from === to) throw Object.assign(new Error(`${to} is already the main currency.`), { status: 400 })
  const conv = converter(input.rate, input.rounding)

  const products = await q.query<{ id: string; price: number; compare_at_price: number | null; prices: PriceBook }>('SELECT id, price, compare_at_price, prices FROM products FOR UPDATE')
  const bookOf = new Map<string, PriceBook>()
  const oldOf = new Map<string, { price: number; compareAtPrice: number | null }>()
  for (const p of products) {
    const book = p.prices ?? {}
    bookOf.set(p.id, book)
    oldOf.set(p.id, { price: Number(p.price), compareAtPrice: p.compare_at_price === null ? null : Number(p.compare_at_price) })
    const next = convertPrice(Number(p.price), p.compare_at_price === null ? null : Number(p.compare_at_price), book[to], conv)
    await q.query('UPDATE products SET price = $2, compare_at_price = $3, prices = $4::jsonb, updated_at = now() WHERE id = $1', [
      p.id,
      next.price,
      next.compareAtPrice,
      JSON.stringify(swapBook(book, from, to, Number(p.price), p.compare_at_price === null ? null : Number(p.compare_at_price))),
    ])
  }

  const variants = await q.query<{ id: string; product_id: string; price: number; compare_at_price: number | null; prices: PriceBook }>('SELECT id, product_id, price, compare_at_price, prices FROM variants FOR UPDATE')
  for (const v of variants) {
    const own = v.prices ?? {}
    // A size's own price in the new currency, else its product's, else converted.
    const next = convertPrice(Number(v.price), v.compare_at_price === null ? null : Number(v.compare_at_price), own[to] ?? bookOf.get(v.product_id)?.[to], conv)
    const book = { ...own }
    delete book[to]
    // In the old currency a size uses its product's price; one that had its own keeps it as an override.
    const old = { price: Number(v.price), compareAtPrice: v.compare_at_price === null ? null : Number(v.compare_at_price) }
    const parent = oldOf.get(v.product_id)
    if (!parent || parent.price !== old.price || parent.compareAtPrice !== old.compareAtPrice) book[from] = old
    await q.query('UPDATE variants SET price = $2, compare_at_price = $3, prices = $4::jsonb WHERE id = $1', [v.id, next.price, next.compareAtPrice, JSON.stringify(book)])
  }

  const coupons = await q.query<{ code: string; type: 'percentage' | 'fixed'; value: number; min_purchase: number; amounts: Record<string, { value: number | null; minPurchase: number }> }>(
    'SELECT code, type, value, min_purchase, amounts FROM coupons FOR UPDATE'
  )
  for (const c of coupons) {
    const amounts = { ...(c.amounts ?? {}) }
    const own = amounts[to]
    delete amounts[to]
    amounts[from] = { value: c.type === 'fixed' ? Number(c.value) : null, minPurchase: Number(c.min_purchase) }
    const value = c.type === 'fixed' ? (own?.value ?? conv(Number(c.value))) : Number(c.value)
    const minPurchase = own ? own.minPurchase : conv(Number(c.min_purchase))
    await q.query('UPDATE coupons SET value = $2, min_purchase = $3, amounts = $4::jsonb WHERE code = $1', [c.code, value, minPurchase, JSON.stringify(amounts)])
  }

  const next = switchCommerce(commerce, input)
  await q.query(
    `INSERT INTO settings (key, value, updated_at) VALUES ('commerce', $1::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [JSON.stringify(next)]
  )
  return { from, to, products: products.length, variants: variants.length, coupons: coupons.length }
}

export function switchBaseCurrency(input: SwitchInput): Promise<SwitchResult> {
  return tx((q) => switchIn(q, input))
}
