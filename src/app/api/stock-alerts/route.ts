import { createStockAlert } from '@/server/repo/misc'
import { throttle } from '@/server/auth'
import { clientIp, HttpError, ok, parseBody, route } from '@/server/http'
import { stockAlertSchema } from '@/server/validation'

export const POST = route(async (req) => {
  const input = await parseBody(req, stockAlertSchema)
  if (!throttle(`alert:${clientIp(req)}`, 20)) throw new HttpError(429, 'Too many requests. Please try again later.')
  const created = await createStockAlert(input.productId, input.variantId ?? null, input.email)
  if (!created) throw new HttpError(404, 'Product not found.')
  return ok({ ok: true }, { status: 201 })
})
