import { CheckoutError, getOrderById, updateOrderAdmin } from '@/server/repo/orders'
import { invalidate } from '@/server/catalog'
import { HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { orderPatchSchema } from '@/server/validation'

type Ctx = { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export const GET = route<Ctx>(async (_req, { params }) => {
  await requireAdmin()
  const order = await getOrderById((await params).id)
  if (!order) throw new HttpError(404, 'Order not found.')
  return ok({ order })
})

export const PATCH = route<Ctx>(async (req, { params }) => {
  await requireAdmin()
  const patch = await parseBody(req, orderPatchSchema)
  try {
    const order = await updateOrderAdmin((await params).id, patch)
    if (!order) throw new HttpError(404, 'Order not found.')
    // Cancelling restocks inventory.
    if (patch.status === 'cancelled') invalidate('products')
    return ok({ order })
  } catch (err) {
    if (err instanceof CheckoutError) throw new HttpError(err.status, err.message)
    throw err
  }
})
