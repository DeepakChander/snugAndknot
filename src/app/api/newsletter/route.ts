import { subscribe } from '@/server/repo/misc'
import { throttle } from '@/server/auth'
import { clientIp, HttpError, ok, parseBody, route } from '@/server/http'
import { newsletterSchema } from '@/server/validation'

export const POST = route(async (req) => {
  const input = await parseBody(req, newsletterSchema)
  if (!throttle(`news:${clientIp(req)}`, 10)) throw new HttpError(429, 'Too many attempts. Please try again later.')
  const { created } = await subscribe(input.email, input.source || 'site')
  return ok({ created, message: created ? 'Welcome to the atelier.' : 'You are already on the list.' })
})
