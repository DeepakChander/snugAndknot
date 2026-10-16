/** Rounding a converted price the owner's way (shared by the admin preview and the server). */
export type Rounding = 'exact' | 'whole' | 'ninety-nine'

/** old amount → new currency, rounded the owner's way. 0 stays 0. */
export function converter(rate: number, rounding: Rounding) {
  return (amount: number) => {
    const raw = amount * rate
    if (amount <= 0) return 0
    if (rounding === 'exact') return Math.round(raw * 100) / 100
    if (rounding === 'whole') return Math.max(1, Math.round(raw))
    // To the nearest price ending in 99 (₹1,299, ₹849 → ₹899 …); small amounts round to whole units.
    if (raw < 100) return Math.max(1, Math.round(raw))
    return Math.max(99, Math.round((raw + 1) / 100) * 100 - 1)
  }
}

/** A price and its compare-at price in the new currency: the owner's own if set, else converted. */
export function convertPrice(price: number, compareAt: number | null, own: { price: number; compareAtPrice: number | null } | undefined, conv: (n: number) => number) {
  if (own) return { price: own.price, compareAtPrice: own.compareAtPrice }
  const p = conv(price)
  const c = compareAt !== null ? conv(compareAt) : null
  // Rounding can close the gap between the two; a "was" price that is not higher is dropped.
  return { price: p, compareAtPrice: c !== null && c > p ? c : null }
}
