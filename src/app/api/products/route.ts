import { getProducts } from '@/server/catalog'
import { clientIp, ok, route } from '@/server/http'
import { rateLimit } from '@/server/rate-limit'
import type { Gender, SortOption } from '@/types/commerce'

const SORTS: SortOption[] = ['featured', 'newest', 'price-asc', 'price-desc', 'rating']
const GENDERS: Gender[] = ['men', 'women', 'kids', 'unisex']

export const GET = route(async (req) => {
  const sp = new URL(req.url).searchParams
  if (sp.get('q')) await rateLimit('search', clientIp(req))
  const sort = sp.get('sort') as SortOption | null
  const gender = sp.get('gender') as Gender | null
  const limit = Number(sp.get('limit'))
  const products = await getProducts({
    search: sp.get('q')?.slice(0, 80) || undefined,
    gender: gender && GENDERS.includes(gender) ? gender : undefined,
    category: sp.get('category') || undefined,
    sort: sort && SORTS.includes(sort) ? sort : undefined,
    limit: Number.isFinite(limit) && limit > 0 ? Math.min(limit, 48) : undefined,
  })
  return ok({ products })
})
