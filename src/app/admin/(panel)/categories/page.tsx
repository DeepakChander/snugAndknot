import { CategoriesAdmin } from '@/components/admin/CatalogAdmin'
import { listCategories } from '@/server/repo/collections'
import { listProducts } from '@/server/repo/products'

export const metadata = { title: 'Categories' }

export default async function AdminCategories() {
  const [categories, products] = await Promise.all([listCategories(), listProducts({ status: 'any' })])
  const counts: Record<string, number> = {}
  for (const p of products) if (p.category) counts[p.category] = (counts[p.category] ?? 0) + 1
  return <CategoriesAdmin categories={categories} counts={counts} />
}
