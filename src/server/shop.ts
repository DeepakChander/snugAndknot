import 'server-only'
import { getAllCategories, getCategories, getFacets, getProducts, getStoreSettings } from './catalog'
import { readFilters } from '@/lib/shop-filters'
import { categoryHref, openDepartments, type Department } from '@/lib/categories'
import type { Gender, SortOption } from '@/types/commerce'

export const DEPARTMENTS: Record<'women' | 'men' | 'kids', { title: string; description: string }> = {
  women: { title: 'Women', description: 'Everyday clothing for women: tops, shirts, knitwear, dresses, trousers and more.' },
  men: { title: 'Men', description: 'Everyday clothing for men: shirts, T-shirts, polos, knitwear, trousers, cargos and more.' },
  kids: { title: 'Kids', description: 'Clothes for boys, girls and babies: T-shirts, shirts, bottoms, sets and knitwear.' },
}

type SP = Record<string, string | string[] | undefined>

/** Everything ShopView needs for a department, category or the full catalogue. */
export async function loadShop(scope: { gender?: Gender; category?: string; department?: Department; activeHref: string }, sp: SP) {
  const filters = readFilters(sp)
  const [products, all, facets, categories, everyCategory, settings] = await Promise.all([
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
    getAllCategories(),
    getStoreSettings(),
  ])
  const open = openDepartments(settings.store)
  const count = (g: 'men' | 'women' | 'kids') => all.filter((p) => p.gender === g || (g !== 'kids' && p.gender === 'unisex')).length
  const segments = [
    { label: 'All', href: '/shop', active: scope.activeHref === '/shop', count: all.length },
    ...(['women', 'men', 'kids'] as const)
      .filter((d) => open.includes(d))
      .map((d) => ({ label: DEPARTMENTS[d].title, href: `/shop/${d}`, active: scope.activeHref === `/shop/${d}`, count: count(d) })),
  ]
  // Inside a department, its whole menu range (as the header lists it); elsewhere, every category with pieces.
  const department = scope.department ?? (scope.gender && scope.gender !== 'unisex' ? scope.gender : undefined)
  const categoryLinks = (department ? everyCategory.filter((c) => c.department === department && c.showInMenu) : categories.filter((c) => !c.department || open.includes(c.department)))
    .map((c) => ({ label: c.title, href: categoryHref(c), active: scope.activeHref === categoryHref(c) }))
  // A department's own page opens with its categories as photograph tiles (those with an image).
  const tiles =
    department && !scope.category
      ? everyCategory.filter((c) => c.department === department && c.showInMenu && c.image).map((c) => ({ label: c.title, href: categoryHref(c), image: c.image }))
      : []
  return { products, facets, filters, segments, categories: categoryLinks, tiles }
}
