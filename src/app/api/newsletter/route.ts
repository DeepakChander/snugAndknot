import { subscribe } from '@/server/repo/misc'
import { rateLimit } from '@/server/rate-limit'
import { clientIp, ok, parseBody, route } from '@/server/http'
import { newsletterSchema } from '@/server/validation'

export const POST = route(async (req) => {
  const input = await parseBody(req, newsletterSchema)
  await rateLimit('newsletter', clientIp(req))
  const { created } = await subscribe(input.email, input.source || 'site')
  return ok({ created, message: created ? 'Welcome to the atelier.' : 'You are already on the list.' })
})
