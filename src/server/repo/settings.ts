import 'server-only'
import { query } from '@/server/db/client'
import { DEFAULT_SETTINGS, mergeSettings } from '@/lib/settings-defaults'
import type { SettingsKey, SiteSettings } from '@/types/commerce'

export async function getSettings(): Promise<SiteSettings> {
  const rows = await query<{ key: string; value: unknown }>('SELECT key, value FROM settings')
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return mergeSettings(DEFAULT_SETTINGS, stored)
}

export async function saveSettings<K extends SettingsKey>(key: K, value: SiteSettings[K]): Promise<SiteSettings[K]> {
  const merged = mergeSettings(DEFAULT_SETTINGS[key] as object, value) as SiteSettings[K]
  await query(
    `INSERT INTO settings (key, value, updated_at) VALUES ($1, $2::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(merged)]
  )
  return merged
}
