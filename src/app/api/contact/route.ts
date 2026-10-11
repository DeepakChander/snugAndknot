import { createMessage } from '@/server/repo/misc'
import { rateLimit } from '@/server/rate-limit'
import { clientIp, ok, parseBody, route } from '@/server/http'
import { contactSchema } from '@/server/validation'

export const POST = route(async (req) => {
  const input = await parseBody(req, contactSchema)
  await rateLimit('contact', clientIp(req))
  await rateLimit('contactDaily', clientIp(req))
  await createMessage({ name: input.name, email: input.email, subject: input.subject ?? '', body: input.message })
  return ok({ ok: true }, { status: 201 })
})
