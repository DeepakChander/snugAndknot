import { ConflictError, createProduct, listProducts } from '@/server/repo/products'
import { newId } from '@/server/repo/util'
import { invalidate } from '@/server/catalog'
import { HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { productSchema } from '@/server/validation'
import { productCreated } from '@/server/notify-events'

export const dynamic = 'force-dynamic'

export const GET = route(async (req) => {
  await requireAdmin()
  const q = new URL(req.url).searchParams.get('q') || undefined
  return ok({ products: await listProducts({ status: 'any', search: q, sort: 'newest' }) })
})

export const POST = route(async (req) => {
  const admin = await requireAdmin()
  const input = await parseBody(req, productSchema)
  try {
    const product = await createProduct(newId('prd'), input)
    invalidate('products', 'categories', 'collections')
    await productCreated(product, admin.email)
    return ok({ product }, { status: 201 })
  } catch (err) {
    if (err instanceof ConflictError) throw new HttpError(409, err.message)
    throw err
  }
})
