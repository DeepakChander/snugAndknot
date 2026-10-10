/** URL search params ⇄ shop filters. Shared by server pages and client controls. */
export interface ShopFilters {
  sort: string
  sizes: string[]
  colors: string[]
  min: number | null
  max: number | null
}

export function readFilters(sp: Record<string, string | string[] | undefined>): ShopFilters {
  const arr = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean).slice(0, 12)
  const num = (v: string | string[] | undefined) => {
    const n = Number(Array.isArray(v) ? v[0] : v)
    return Number.isFinite(n) && n >= 0 ? n : null
  }
  const sort = typeof sp.sort === 'string' && ['featured', 'newest', 'price-asc', 'price-desc', 'rating'].includes(sp.sort) ? sp.sort : 'featured'
  return { sort, sizes: arr(sp.size), colors: arr(sp.color), min: num(sp.min), max: num(sp.max) }
}
