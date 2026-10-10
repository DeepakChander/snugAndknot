import { findOrderForGuest } from '@/server/repo/orders'
import { throttle } from '@/server/auth'
import { clientIp, HttpError, ok, parseBody, route } from '@/server/http'
import { orderLookupSchema } from '@/server/validation'

/** Guest order tracking: order number + the email used at checkout. */
export const POST = route(async (req) => {
  const input = await parseBody(req, orderLookupSchema)
  if (!throttle(`lookup:${clientIp(req)}`, 15)) throw new HttpError(429, 'Too many lookups. Please wait a few minutes.')
  const order = await findOrderForGuest(input.orderNumber, input.email)
  if (!order) throw new HttpError(404, 'We could not find an order with that number and email.')
  return ok({ order })
})
