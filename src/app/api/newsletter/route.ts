import { subscribe } from '@/server/repo/misc'
import { rateLimit } from '@/server/rate-limit'
import { clientIp, ok, parseBody, route } from '@/server/http'
import { newsletterSchema } from '@/server/validation'
import { newsletterSubscribed } from '@/server/notify-events'

export const POST = route(async (req) => {
  const input = await parseBody(req, newsletterSchema)
  await rateLimit('newsletter', clientIp(req))
  const { created } = await subscribe(input.email, input.source || 'site')
  if (created) await newsletterSubscribed(input.email, input.source || 'site')
  return ok({ created, message: created ? 'You are on the list. Welcome.' : 'You are already on the list.' })
})
