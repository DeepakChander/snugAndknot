import 'server-only'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import * as products from './repo/products'
import * as collections from './repo/collections'
import * as reviews from './repo/reviews'
import { getSettings } from './repo/settings'
import type { Gender, SortOption } from '@/types/commerce'

/**
 * Cached reads for the storefront. Admin writes call `invalidate(...)`, so edits show
 * on the live site immediately; the 5-minute fallback only matters if a tag is missed.
 */
export const TAGS = {
  products: 'catalog:products',
  collections: 'catalog:collections',
  categories: 'catalog:categories',
  settings: 'catalog:settings',
  reviews: 'catalog:reviews',
} as const

const REVALIDATE = 300

export const getStoreSettings = unstable_cache(() => getSettings(), ['settings'], {
  tags: [TAGS.settings],
  revalidate: REVALIDATE,
})

export const getProducts = unstable_cache(
  (opts: {
    gender?: Gender
    category?: string
    sort?: SortOption
    search?: string
    ids?: string[]
    featured?: boolean
    isNew?: boolean
    sizes?: string[]
    colors?: string[]
    minPrice?: number
    maxPrice?: number
    limit?: number
  } = {}) => products.listProducts(opts),
  ['products'],
  { tags: [TAGS.products, TAGS.reviews], revalidate: REVALIDATE }
)

export const getProduct = unstable_cache((handle: string) => products.getProductByHandle(handle), ['product'], {
  tags: [TAGS.products, TAGS.reviews],
  revalidate: REVALIDATE,
})

export const getRelated = unstable_cache(
  async (handle: string, limit = 4) => {
    const p = await products.getProductByHandle(handle)
    return p ? products.getRelatedProducts(p, limit) : []
  },
  ['related'],
  { tags: [TAGS.products, TAGS.reviews], revalidate: REVALIDATE }
)

export const getFacets = unstable_cache(() => products.getCatalogFacets(), ['facets'], {
  tags: [TAGS.products],
  revalidate: REVALIDATE,
})

export const getCollections = unstable_cache(() => collections.listCollections(), ['collections'], {
  tags: [TAGS.collections],
  revalidate: REVALIDATE,
})

export const getCollection = unstable_cache((handle: string) => collections.getCollectionByHandle(handle), ['collection'], {
  tags: [TAGS.collections],
  revalidate: REVALIDATE,
})

export const getCategories = unstable_cache(() => collections.listActiveCategories(), ['categories'], {
  tags: [TAGS.categories, TAGS.products],
  revalidate: REVALIDATE,
})

export const getCategory = unstable_cache((slug: string) => collections.getCategory(slug), ['category'], {
  tags: [TAGS.categories],
  revalidate: REVALIDATE,
})

export const getReviews = unstable_cache(
  async (productId: string) => ({
    reviews: await reviews.listApprovedReviews(productId),
    summary: await reviews.getRatingSummary(productId),
  }),
  ['reviews'],
  { tags: [TAGS.reviews], revalidate: REVALIDATE }
)

/** Expire cached storefront data right away and re-render affected pages. */
export function invalidate(...tags: (keyof typeof TAGS)[]) {
  for (const t of tags) revalidateTag(TAGS[t], { expire: 0 })
  revalidatePath('/', 'layout')
}
