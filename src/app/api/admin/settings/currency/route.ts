import { switchBaseCurrency } from '@/server/currency-switch'
import { getSettings } from '@/server/repo/settings'
import { invalidate } from '@/server/catalog'
import { HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { currencySwitchSchema } from '@/server/validation'
import { settingsUpdated } from '@/server/notify-events'

export const dynamic = 'force-dynamic'

/** Changes the main currency, converting every base-currency amount (see server/currency-switch). */
export const POST = route(async (req) => {
  const admin = await requireAdmin()
  const input = await parseBody(req, currencySwitchSchema)
  const before = (await getSettings()).commerce
  let result
  try {
    result = await switchBaseCurrency(input)
  } catch (err) {
    const status = (err as { status?: number }).status
    if (status === 400) throw new HttpError(400, (err as Error).message)
    throw err
  }
  invalidate('settings', 'products', 'categories', 'collections')
  const after = (await getSettings()).commerce
  await settingsUpdated('commerce', before, after, admin.email)
  return ok({ result, commerce: after })
})
