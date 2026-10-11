import { InboxAdmin } from '@/components/admin/PeopleAdmin'
import { listMessages, listStockAlerts, listSubscribers } from '@/server/repo/misc'
import { requireAdminPage } from '@/server/guards'

export const metadata = { title: 'Inbox' }

const TABS = ['messages', 'subscribers', 'alerts'] as const

export default async function AdminInbox({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdminPage()
  const [{ tab }, messages, subscribers, alerts] = await Promise.all([searchParams, listMessages(), listSubscribers(), listStockAlerts()])
  const initialTab = TABS.find((t) => t === tab) ?? 'messages'
  return <InboxAdmin key={initialTab} messages={messages} subscribers={subscribers} alerts={alerts} initialTab={initialTab} />
}
