import { SettingsAdmin } from '@/components/admin/SettingsAdmin'
import { getSettings } from '@/server/repo/settings'
import type { SettingsKey } from '@/types/commerce'
import { requireAdminPage } from '@/server/guards'
import { razorpayStatus } from '@/server/razorpay'
import { absoluteUrl } from '@/lib/site'

export const metadata = { title: 'Settings' }

const KEYS: SettingsKey[] = ['store', 'commerce', 'announcement', 'reviews', 'homepage', 'seo']

export default async function AdminSettings({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdminPage()
  const [{ tab }, settings] = await Promise.all([searchParams, getSettings()])
  const active = KEYS.includes(tab as SettingsKey) ? (tab as SettingsKey) : 'store'
  const payments = { ...razorpayStatus(), webhookUrl: absoluteUrl('/api/webhooks/razorpay') }
  return <SettingsAdmin key={active} settings={settings} tab={active} payments={payments} />
}
