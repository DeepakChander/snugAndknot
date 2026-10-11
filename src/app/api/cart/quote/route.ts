import { quoteCart } from '@/server/repo/orders'
import { getSettings } from '@/server/repo/settings'
import { clientIp, ok, parseBody, route } from '@/server/http'
import { rateLimit } from '@/server/rate-limit'
import { quoteSchema } from '@/server/validation'

export const POST = route(async (req) => {
  const input = await parseBody(req, quoteSchema)
  await rateLimit('quote', clientIp(req))
  const settings = await getSettings()
  const quote = await quoteCart(input.lines, {
    couponCode: input.couponCode,
    shippingMethod: input.shippingMethod,
    commerce: settings.commerce,
  })
  return ok({ quote })
})
