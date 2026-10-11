import { currentUser } from '@/server/auth'
import { ok, route } from '@/server/http'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  const user = await currentUser()
  return ok({ user }, { headers: { 'Cache-Control': 'no-store' } })
})
