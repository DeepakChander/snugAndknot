import ProductEditor from '@/components/admin/ProductEditor'
import { listCategories } from '@/server/repo/collections'
import { requireAdminPage } from '@/server/guards'

export const metadata = { title: 'New product' }

export default async function NewProduct() {
  await requireAdminPage()
  return <ProductEditor product={null} categories={await listCategories()} />
}
