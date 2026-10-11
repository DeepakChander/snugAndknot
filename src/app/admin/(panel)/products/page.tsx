import ProductsList from '@/components/admin/ProductsList'
import { listProducts } from '@/server/repo/products'
import { requireAdminPage } from '@/server/guards'

export const metadata = { title: 'Products' }

export default async function AdminProducts() {
  await requireAdminPage()
  return <ProductsList products={await listProducts({ status: 'any', sort: 'newest' })} />
}
