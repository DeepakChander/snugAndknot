import { endSession } from '@/server/auth'
import { guardWrite, ok, route } from '@/server/http'

export const POST = route(async (req) => {
  guardWrite(req)
  await endSession()
  return ok({ ok: true })
})
