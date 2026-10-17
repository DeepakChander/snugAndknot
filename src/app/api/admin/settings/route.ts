import { z } from 'zod'
import { getSettings, saveSettings } from '@/server/repo/settings'
import { invalidate } from '@/server/catalog'
import { HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { settingsSchemas } from '@/server/validation'
import type { SettingsKey, SiteSettings } from '@/types/commerce'
import { settingsUpdated } from '@/server/notify-events'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  await requireAdmin()
  return ok({ settings: await getSettings() })
})

const envelope = z.object({
  section: z.enum(['store', 'commerce', 'announcement', 'reviews', 'homepage', 'seo', 'videos', 'showcase']),
  value: z.unknown(),
})

export const PUT = route(async (req) => {
  const admin = await requireAdmin()
  const { section, value } = await parseBody(req, envelope)
  const parsed = settingsSchemas[section].safeParse(value)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) fields[issue.path.join('.')] ??= issue.message
    const first = parsed.error.issues[0]
    throw new HttpError(422, `${first.path.join('.')}: ${first.message}`, fields)
  }
  const before = (await getSettings())[section as SettingsKey]
  // The main currency only changes through the conversion tool (/api/admin/settings/currency):
  // relabelling it here would turn $139 into ₹139 without converting a single price.
  if (section === 'commerce' && (parsed.data as { currency: string }).currency.toUpperCase() !== (before as { currency: string }).currency.toUpperCase()) {
    throw new HttpError(400, 'Change the main currency with "Change main currency", which converts every price.', { currency: 'Use Change main currency to switch it.' })
  }
  const saved = await saveSettings(section as SettingsKey, parsed.data as SiteSettings[SettingsKey])
  invalidate('settings')
  await settingsUpdated(section, before, saved, admin.email)
  return ok({ section, value: saved })
})
