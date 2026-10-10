import { quoteCart } from '@/server/repo/orders'
import { getSettings } from '@/server/repo/settings'
import { ok, parseBody, route } from '@/server/http'
import { quoteSchema } from '@/server/validation'

export const POST = route(async (req) => {
  const input = await parseBody(req, quoteSchema)
  const settings = await getSettings()
  const quote = await quoteCart(input.lines, {
    couponCode: input.couponCode,
    shippingMethod: input.shippingMethod,
    commerce: settings.commerce,
  })
  return ok({ quote })
})
