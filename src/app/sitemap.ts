import type { MetadataRoute } from 'next'
import { getCategories, getCollections, getProducts, getStoreSettings } from '@/server/catalog'
import { JOURNAL } from '@/lib/journal'
import { absoluteUrl } from '@/lib/site'
import type { Product } from '@/types/commerce'
import { categoryHref, openDepartments } from '@/lib/categories'

type Entry = MetadataRoute.Sitemap[number]

/** Every indexable page, with its photographs so they can appear in image search. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, allCategories, settings] = await Promise.all([getProducts({}), getCollections(), getCategories(), getStoreSettings()])
  const open = openDepartments(settings.store)
  // Closed departments have no pages.
  const categories = allCategories.filter((c) => !c.department || open.includes(c.department))
  const latest = (list: Product[]) => (list.length ? new Date(Math.max(...list.map((p) => Date.parse(p.updatedAt)))) : undefined)
  const page = (path: string, priority: number, extra: Partial<Entry> = {}): Entry => ({ url: absoluteUrl(path), priority, ...extra })
  const images = (srcs: (string | undefined)[]) => srcs.filter((s): s is string => !!s).map(absoluteUrl)

  // Departments only when they have pieces (the kids' page is a "coming soon" note).
  const departments = (['women', 'men', 'kids'] as const).filter((d) => open.includes(d)).flatMap((d) => {
    const list = products.filter((p) => p.gender === d || (d !== 'kids' && p.gender === 'unisex'))
    return list.length ? [page(`/shop/${d}`, 0.8, { lastModified: latest(list), changeFrequency: 'weekly' })] : []
  })

  return [
    page('/', 1, { lastModified: latest(products), changeFrequency: 'daily' }),
    page('/shop', 0.9, { lastModified: latest(products), changeFrequency: 'daily' }),
    ...departments,
    ...categories.map((c) => {
      const list = products.filter((p) => p.category === c.slug)
      return page(categoryHref(c), 0.7, { lastModified: latest(list), changeFrequency: 'weekly', images: images([c.image]) })
    }),
    page('/collections', 0.8, { changeFrequency: 'weekly' }),
    ...collections.map((c) => {
      const list = products.filter((p) => c.productIds.includes(p.id))
      return page(`/collections/${c.handle}`, 0.7, { lastModified: latest(list), changeFrequency: 'weekly', images: images([c.image]) })
    }),
    ...products.map((p) =>
      page(`/product/${p.handle}`, 0.8, { lastModified: new Date(p.updatedAt), changeFrequency: 'weekly', images: images(p.images.map((i) => i.src)) })
    ),
    page('/lookbook', 0.6, { changeFrequency: 'monthly' }),
    page('/journal', 0.6, { lastModified: JOURNAL.length ? new Date(Math.max(...JOURNAL.map((j) => Date.parse(j.date)))) : undefined, changeFrequency: 'weekly' }),
    ...JOURNAL.map((j) => page(`/journal/${j.slug}`, 0.5, { lastModified: new Date(j.date), changeFrequency: 'monthly', images: images([j.image]) })),
    page('/about', 0.6, { changeFrequency: 'monthly' }),
    page('/faq', 0.5, { changeFrequency: 'monthly' }),
    page('/shipping-returns', 0.4, { changeFrequency: 'monthly' }),
    page('/care-instructions', 0.4, { changeFrequency: 'monthly' }),
    page('/size-guide', 0.4, { changeFrequency: 'monthly' }),
    page('/contact', 0.4, { changeFrequency: 'yearly' }),
    page('/privacy-policy', 0.2, { changeFrequency: 'yearly' }),
    page('/terms-of-service', 0.2, { changeFrequency: 'yearly' }),
  ]
}
