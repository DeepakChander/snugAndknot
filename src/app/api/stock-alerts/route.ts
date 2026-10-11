import { createStockAlert } from '@/server/repo/misc'
import { rateLimit } from '@/server/rate-limit'
import { clientIp, HttpError, ok, parseBody, route } from '@/server/http'
import { stockAlertSchema } from '@/server/validation'

export const POST = route(async (req) => {
  const input = await parseBody(req, stockAlertSchema)
  await rateLimit('stockAlert', clientIp(req))
  const created = await createStockAlert(input.productId, input.variantId ?? null, input.email)
  if (!created) throw new HttpError(404, 'Product not found.')
  return ok({ ok: true }, { status: 201 })
})
