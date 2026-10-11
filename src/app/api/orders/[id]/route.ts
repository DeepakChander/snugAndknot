import { getOrderById } from '@/server/repo/orders'
import { currentUser } from '@/server/auth'
import { HttpError, ok, route } from '@/server/http'

type Ctx = { params: Promise<{ id: string }> }

export const dynamic = 'force-dynamic'

export const GET = route<Ctx>(async (_req, { params }) => {
  const { id } = await params
  const user = await currentUser()
  if (!user) throw new HttpError(401, 'Please sign in to view this order.')
  const order = await getOrderById(id)
  if (!order || (order.userId !== user.id && user.role !== 'admin')) throw new HttpError(404, 'Order not found.')
  return ok({ order }, { headers: { 'Cache-Control': 'no-store' } })
})
