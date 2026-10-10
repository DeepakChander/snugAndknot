import { CollectionsAdmin } from '@/components/admin/CatalogAdmin'
import { listCollections } from '@/server/repo/collections'
import { listProducts } from '@/server/repo/products'

export const metadata = { title: 'Collections' }

export default async function AdminCollections() {
  const [collections, products] = await Promise.all([listCollections(), listProducts({ status: 'any', sort: 'newest' })])
  return <CollectionsAdmin collections={collections} products={products.map((p) => ({ id: p.id, title: p.title, image: p.images[0]?.src ?? '', status: p.status }))} />
}
