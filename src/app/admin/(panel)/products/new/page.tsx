import ProductEditor from '@/components/admin/ProductEditor'
import { listCategories } from '@/server/repo/collections'

export const metadata = { title: 'New product' }

export default async function NewProduct() {
  return <ProductEditor product={null} categories={await listCategories()} />
}
