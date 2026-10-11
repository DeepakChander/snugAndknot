import type { Metadata } from 'next'
import CollectionsIndex from '@/components/collections/CollectionsIndex'
import { getCollections, getProducts } from '@/server/catalog'

export const metadata: Metadata = {
  alternates: { canonical: '/collections' },
  title: 'Collections',
  description: 'Snug&Knot collections — knitwear gathered around a feeling: winter warmth, the artisan edit, everyday essentials and coastal walks.',
}

export default async function CollectionsPage() {
  const [collections, products] = await Promise.all([getCollections(), getProducts({})])
  const active = new Set(products.map((p) => p.id))
  return <CollectionsIndex collections={collections.map((c) => ({ ...c, count: c.productIds.filter((id) => active.has(id)).length }))} />
}
