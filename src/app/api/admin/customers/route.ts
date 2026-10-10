import { listCustomers } from '@/server/repo/misc'
import { ok, requireAdmin, route } from '@/server/http'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  await requireAdmin()
  return ok({ customers: await listCustomers() })
})
