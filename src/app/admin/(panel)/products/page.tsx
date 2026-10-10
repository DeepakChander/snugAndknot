import ProductsList from '@/components/admin/ProductsList'
import { listProducts } from '@/server/repo/products'

export const metadata = { title: 'Products' }

export default async function AdminProducts() {
  return <ProductsList products={await listProducts({ status: 'any', sort: 'newest' })} />
}
