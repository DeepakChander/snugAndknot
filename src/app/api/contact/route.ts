import { createMessage } from '@/server/repo/misc'
import { throttle } from '@/server/auth'
import { clientIp, HttpError, ok, parseBody, route } from '@/server/http'
import { contactSchema } from '@/server/validation'

export const POST = route(async (req) => {
  const input = await parseBody(req, contactSchema)
  if (!throttle(`contact:${clientIp(req)}`, 5, 10 * 60_000)) {
    throw new HttpError(429, 'You have sent several messages already. Please wait a few minutes.')
  }
  await createMessage({ name: input.name, email: input.email, subject: input.subject ?? '', body: input.message })
  return ok({ ok: true }, { status: 201 })
})
