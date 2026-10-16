import { CategoriesAdmin } from '@/components/admin/CatalogAdmin'
import { listCategories } from '@/server/repo/collections'
import { listProducts } from '@/server/repo/products'
import { getSettings } from '@/server/repo/settings'
import { requireAdminPage } from '@/server/guards'

export const metadata = { title: 'Categories' }

export default async function AdminCategories() {
  await requireAdminPage()
  const [categories, products, settings] = await Promise.all([listCategories(), listProducts({ status: 'any' }), getSettings()])
  const counts: Record<string, number> = {}
  for (const p of products) if (p.category) counts[p.category] = (counts[p.category] ?? 0) + 1
  return <CategoriesAdmin categories={categories} counts={counts} store={settings.store} />
}
