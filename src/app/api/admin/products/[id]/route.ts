import { ConflictError, deleteProduct, getProductById, updateProduct } from '@/server/repo/products'
import { invalidate } from '@/server/catalog'
import { guardWrite, HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { productSchema } from '@/server/validation'
import { catalogChanged, productUpdated, restockedWithWaitlist } from '@/server/notify-events'

type Ctx = { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export const GET = route<Ctx>(async (_req, { params }) => {
  await requireAdmin()
  const product = await getProductById((await params).id)
  if (!product) throw new HttpError(404, 'Product not found.')
  return ok({ product })
})

export const PUT = route<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin()
  const input = await parseBody(req, productSchema)
  const { id } = await params
  try {
    const before = await getProductById(id)
    const product = await updateProduct(id, input)
    if (!product) throw new HttpError(404, 'Product not found.')
    invalidate('products', 'categories', 'collections')
    if (before) {
      await productUpdated(before, product, admin.email)
      await restockedWithWaitlist(before, product, admin.email)
    }
    return ok({ product })
  } catch (err) {
    if (err instanceof ConflictError) throw new HttpError(409, err.message)
    throw err
  }
})

export const DELETE = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  const admin = await requireAdmin()
  const { id } = await params
  const before = await getProductById(id)
  const deleted = await deleteProduct(id)
  if (!deleted) throw new HttpError(404, 'Product not found.')
  invalidate('products', 'categories', 'collections', 'reviews')
  await catalogChanged('Product', 'deleted', before?.title ?? id, admin.email, [['Handle', before?.handle]])
  return ok({ ok: true })
})
