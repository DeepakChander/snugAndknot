import type { MetadataRoute } from 'next'
import { getCategories, getCollections, getProducts } from '@/server/catalog'
import { JOURNAL } from '@/lib/journal'

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://snug-andknot.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, categories] = await Promise.all([getProducts({}), getCollections(), getCategories()])
  const now = new Date()
  const page = (path: string, priority: number, changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly') => ({ url: `${BASE}${path}`, lastModified: now, changeFrequency, priority })
  return [
    page('/', 1, 'daily'),
    page('/shop', 0.9, 'daily'),
    page('/shop/women', 0.8),
    page('/shop/men', 0.8),
    page('/collections', 0.8),
    page('/lookbook', 0.6),
    page('/journal', 0.6),
    page('/about', 0.6, 'monthly'),
    page('/contact', 0.5, 'monthly'),
    page('/faq', 0.5, 'monthly'),
    page('/shipping-returns', 0.4, 'monthly'),
    page('/care-instructions', 0.4, 'monthly'),
    page('/size-guide', 0.4, 'monthly'),
    page('/privacy-policy', 0.2, 'monthly'),
    page('/terms-of-service', 0.2, 'monthly'),
    ...categories.map((c) => page(`/shop/${c.slug}`, 0.7)),
    ...collections.map((c) => page(`/collections/${c.handle}`, 0.7)),
    ...products.map((p) => ({ url: `${BASE}/product/${p.handle}`, lastModified: new Date(p.updatedAt), changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...JOURNAL.map((j) => ({ url: `${BASE}/journal/${j.slug}`, lastModified: new Date(j.date), changeFrequency: 'monthly' as const, priority: 0.5 })),
  ]
}
