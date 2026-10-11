import { currentUser, endSession, revokeSessions } from '@/server/auth'
import { guardWrite, ok, route } from '@/server/http'

export const POST = route(async (req) => {
  guardWrite(req)
  // Signing out of the admin ends every admin session for that account, so a copied admin
  // cookie dies with it. Customers just sign out of this device.
  const user = await currentUser()
  if (user?.role === 'admin') await revokeSessions(user.id)
  await endSession()
  return ok({ ok: true })
})
