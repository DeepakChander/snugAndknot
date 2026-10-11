import { CheckoutError, createReturn, listReturnsForUser } from '@/server/repo/orders'
import { getSettings } from '@/server/repo/settings'
import { HttpError, ok, parseBody, requireUser, route } from '@/server/http'
import { returnSchema } from '@/server/validation'
import { rateLimit } from '@/server/rate-limit'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  const user = await requireUser()
  return ok({ returns: await listReturnsForUser(user.id) }, { headers: { 'Cache-Control': 'no-store' } })
})

export const POST = route(async (req) => {
  const user = await requireUser()
  const input = await parseBody(req, returnSchema)
  await rateLimit('returnRequest', user.id)
  const settings = await getSettings()
  try {
    const request = await createReturn({
      userId: user.id,
      orderId: input.orderId,
      items: input.items,
      reason: input.reason,
      comments: input.comments ?? null,
      returnWindowDays: settings.commerce.returnWindowDays,
    })
    return ok({ return: request }, { status: 201 })
  } catch (err) {
    if (err instanceof CheckoutError) throw new HttpError(err.status, err.message)
    throw err
  }
})
