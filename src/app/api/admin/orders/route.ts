import { listOrdersAdmin } from '@/server/repo/orders'
import { ok, requireAdmin, route } from '@/server/http'
import type { OrderStatus } from '@/types/commerce'

export const dynamic = 'force-dynamic'
const STATUSES: OrderStatus[] = ['pending_payment', 'placed', 'confirmed', 'shipped', 'delivered', 'cancelled']

export const GET = route(async (req) => {
  await requireAdmin()
  const sp = new URL(req.url).searchParams
  const status = sp.get('status') as OrderStatus | null
  return ok({
    orders: await listOrdersAdmin({
      status: status && STATUSES.includes(status) ? status : undefined,
      search: sp.get('q') || undefined,
    }),
  })
})
