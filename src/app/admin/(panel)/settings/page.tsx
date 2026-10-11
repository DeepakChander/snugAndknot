import { SettingsAdmin } from '@/components/admin/SettingsAdmin'
import { getSettings } from '@/server/repo/settings'
import type { SettingsKey } from '@/types/commerce'
import { requireAdminPage } from '@/server/guards'

export const metadata = { title: 'Settings' }

const KEYS: SettingsKey[] = ['store', 'commerce', 'announcement', 'reviews', 'homepage', 'seo']

export default async function AdminSettings({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdminPage()
  const [{ tab }, settings] = await Promise.all([searchParams, getSettings()])
  const active = KEYS.includes(tab as SettingsKey) ? (tab as SettingsKey) : 'store'
  return <SettingsAdmin key={active} settings={settings} tab={active} />
}
