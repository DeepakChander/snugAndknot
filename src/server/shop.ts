import 'server-only'
import { getCategories, getFacets, getProducts } from './catalog'
import { readFilters } from '@/lib/shop-filters'
import { categoryHref, type Department } from '@/lib/categories'
import type { Gender, SortOption } from '@/types/commerce'

export const DEPARTMENTS: Record<'women' | 'men' | 'kids', { title: string; description: string }> = {
  women: { title: 'Women', description: 'Cardigans with heirloom stitches and natural buttons — knitted in small runs, finished by hand.' },
  men: { title: 'Men', description: 'Fine-gauge knit tees in merino-cotton and silk-cotton blends, cut to drape and made to last.' },
  kids: { title: 'Kids', description: 'Small knits for small people.' },
}

type SP = Record<string, string | string[] | undefined>

/** Everything ShopView needs for a department, category or the full catalogue. */
export async function loadShop(scope: { gender?: Gender; category?: string; department?: Department; activeHref: string }, sp: SP) {
  const filters = readFilters(sp)
  const [products, all, facets, categories] = await Promise.all([
    getProducts({
      gender: scope.gender,
      category: scope.category,
      sort: filters.sort as SortOption,
      sizes: filters.sizes.length ? filters.sizes : undefined,
      colors: filters.colors.length ? filters.colors : undefined,
      minPrice: filters.min ?? undefined,
      maxPrice: filters.max ?? undefined,
    }),
    getProducts({}),
    getFacets(),
    getCategories(),
  ])
  const count = (g: 'men' | 'women' | 'kids') => all.filter((p) => p.gender === g || (g !== 'kids' && p.gender === 'unisex')).length
  const segments = [
    { label: 'All', href: '/shop', active: scope.activeHref === '/shop', count: all.length },
    { label: 'Women', href: '/shop/women', active: scope.activeHref === '/shop/women', count: count('women') },
    { label: 'Men', href: '/shop/men', active: scope.activeHref === '/shop/men', count: count('men') },
    { label: 'Kids', href: '/shop/kids', active: scope.activeHref === '/shop/kids', count: count('kids') },
  ]
  // Inside a department, its own categories; elsewhere, every category with pieces.
  const department = scope.department ?? (scope.gender && scope.gender !== 'unisex' ? scope.gender : undefined)
  const categoryLinks = categories
    .filter((c) => !department || c.department === department)
    .map((c) => ({ label: c.title, href: categoryHref(c), active: scope.activeHref === categoryHref(c) }))
  const deckSource = products.length ? products : all
  const deck = deckSource
    .filter((p) => p.images[0])
    .slice(0, 3)
    .map((p) => ({ src: p.images[0].src, alt: p.images[0].alt }))
  return { products, facets, filters, segments, categories: categoryLinks, deck }
}
