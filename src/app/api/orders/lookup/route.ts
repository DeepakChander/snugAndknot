import { findOrderForGuest } from '@/server/repo/orders'
import { rateLimit } from '@/server/rate-limit'
import { clientIp, HttpError, ok, parseBody, route } from '@/server/http'
import { orderLookupSchema } from '@/server/validation'
import type { Order } from '@/types/commerce'

/** Shows enough to recognise the delivery without handing a full address to whoever guessed a number. */
function maskForGuest(order: Order): Order {
  const a = order.shippingAddress
  const mask = (s: string) => (s.length <= 2 ? '••' : `${s.slice(0, 2)}${'•'.repeat(Math.min(8, s.length - 2))}`)
  const [first = '', ...rest] = order.customerName.split(' ')
  return {
    ...order,
    customerName: rest.length ? `${first} ${rest.join(' ')[0]}.` : first,
    userId: null,
    notes: null,
    shippingAddress: {
      ...a,
      lastName: a.lastName ? `${a.lastName[0]}.` : '',
      line1: mask(a.line1),
      line2: a.line2 ? mask(a.line2) : undefined,
      phone: a.phone ? `••• ${a.phone.replace(/\D/g, '').slice(-2)}` : undefined,
    },
  }
}

/** Guest order tracking: order number + the email used at checkout. */
export const POST = route(async (req) => {
  const input = await parseBody(req, orderLookupSchema)
  await rateLimit('orderLookupIp', clientIp(req))
  await rateLimit('orderLookupEmail', input.email)
  const order = await findOrderForGuest(input.orderNumber, input.email)
  if (!order) throw new HttpError(404, 'We could not find an order with that number and email.')
  return ok({ order: maskForGuest(order) })
})
