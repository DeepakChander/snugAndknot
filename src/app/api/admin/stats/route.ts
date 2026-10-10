import { dashboardStats } from '@/server/repo/misc'
import { ok, requireAdmin, route } from '@/server/http'
import { getDb } from '@/server/db/client'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  await requireAdmin()
  const db = await getDb()
  return ok({ stats: await dashboardStats(), database: { kind: db.kind, persistent: db.persistent } })
})
