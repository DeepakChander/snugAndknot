import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import CollectionsIndex from '@/components/collections/CollectionsIndex'
import { getCollections, getProducts, getStoreSettings } from '@/server/catalog'

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getStoreSettings(), { title: 'Collections', description: 'Snug&Knot collections: pieces gathered to be worn together.', path: '/collections' })
}

export default async function CollectionsPage() {
  const [collections, products] = await Promise.all([getCollections(), getProducts({})])
  const active = new Set(products.map((p) => p.id))
  return <CollectionsIndex collections={collections.map((c) => ({ ...c, count: c.productIds.filter((id) => active.has(id)).length }))} />
}
