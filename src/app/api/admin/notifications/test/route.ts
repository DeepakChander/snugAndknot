import { guardWrite, ok, requireAdmin, route } from '@/server/http'
import { mailConfig } from '@/server/mail'
import { testEmail } from '@/server/notify-events'

export const dynamic = 'force-dynamic'

/** Sends a test notice to the support inbox, so the owner can check the mail settings. */
export const POST = route(async (req) => {
  guardWrite(req)
  const admin = await requireAdmin()
  await testEmail(admin.email)
  return ok({ configured: mailConfig() !== null })
})
