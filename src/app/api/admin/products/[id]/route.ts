import { ConflictError, deleteProduct, getProductById, updateProduct } from '@/server/repo/products'
import { invalidate } from '@/server/catalog'
import { guardWrite, HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { productSchema } from '@/server/validation'

type Ctx = { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export const GET = route<Ctx>(async (_req, { params }) => {
  await requireAdmin()
  const product = await getProductById((await params).id)
  if (!product) throw new HttpError(404, 'Product not found.')
  return ok({ product })
})

export const PUT = route<Ctx>(async (req, { params }) => {
  await requireAdmin()
  const input = await parseBody(req, productSchema)
  try {
    const product = await updateProduct((await params).id, input)
    if (!product) throw new HttpError(404, 'Product not found.')
    invalidate('products', 'categories', 'collections')
    return ok({ product })
  } catch (err) {
    if (err instanceof ConflictError) throw new HttpError(409, err.message)
    throw err
  }
})

export const DELETE = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  await requireAdmin()
  const deleted = await deleteProduct((await params).id)
  if (!deleted) throw new HttpError(404, 'Product not found.')
  invalidate('products', 'categories', 'collections', 'reviews')
  return ok({ ok: true })
})
