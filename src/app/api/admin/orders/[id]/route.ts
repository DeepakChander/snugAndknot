import { CheckoutError, getOrderAdmin, updateOrderAdmin } from '@/server/repo/orders'
import { invalidate } from '@/server/catalog'
import { HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { orderPatchSchema } from '@/server/validation'
import { orderUpdated } from '@/server/notify-events'

type Ctx = { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export const GET = route<Ctx>(async (_req, { params }) => {
  await requireAdmin()
  const order = await getOrderAdmin((await params).id)
  if (!order) throw new HttpError(404, 'Order not found.')
  return ok({ order })
})

export const PATCH = route<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin()
  const patch = await parseBody(req, orderPatchSchema)
  const { id } = await params
  try {
    const before = await getOrderAdmin(id)
    const order = await updateOrderAdmin(id, patch)
    if (!order) throw new HttpError(404, 'Order not found.')
    // Cancelling restocks inventory.
    if (patch.status === 'cancelled') invalidate('products')
    const after = await getOrderAdmin(id)
    if (before && after) await orderUpdated(before, after, admin.email)
    return ok({ order })
  } catch (err) {
    if (err instanceof CheckoutError) throw new HttpError(err.status, err.message)
    throw err
  }
})
