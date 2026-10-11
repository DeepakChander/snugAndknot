import { listReturnsAdmin } from '@/server/repo/orders'
import { ok, requireAdmin, route } from '@/server/http'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  await requireAdmin()
  return ok({ returns: await listReturnsAdmin() })
})
