import { createStockAlert } from '@/server/repo/misc'
import { rateLimit } from '@/server/rate-limit'
import { clientIp, HttpError, ok, parseBody, route } from '@/server/http'
import { stockAlertSchema } from '@/server/validation'
import { stockAlertRequested } from '@/server/notify-events'

export const POST = route(async (req) => {
  const input = await parseBody(req, stockAlertSchema)
  await rateLimit('stockAlert', clientIp(req))
  const result = await createStockAlert(input.productId, input.variantId ?? null, input.email)
  if (result === 'missing') throw new HttpError(404, 'Product not found.')
  // A repeat request answers the same but adds nothing, so it sends nothing.
  if (result === 'created') await stockAlertRequested(input.productId, input.variantId ?? null, input.email)
  return ok({ ok: true }, { status: 201 })
})
