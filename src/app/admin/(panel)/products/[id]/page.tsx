import { notFound } from 'next/navigation'
import ProductEditor from '@/components/admin/ProductEditor'
import { getProductById } from '@/server/repo/products'
import { listCategories } from '@/server/repo/collections'
import { requireAdminPage } from '@/server/guards'

export const metadata = { title: 'Edit product' }

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage()
  const [product, categories] = await Promise.all([getProductById((await params).id), listCategories()])
  if (!product) notFound()
  return <ProductEditor key={product.updatedAt} product={product} categories={categories} />
}
