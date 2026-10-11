import { InboxAdmin } from '@/components/admin/PeopleAdmin'
import { listMessages, listStockAlerts, listSubscribers } from '@/server/repo/misc'
import { requireAdminPage } from '@/server/guards'

export const metadata = { title: 'Inbox' }

export default async function AdminInbox() {
  await requireAdminPage()
  const [messages, subscribers, alerts] = await Promise.all([listMessages(), listSubscribers(), listStockAlerts()])
  return <InboxAdmin messages={messages} subscribers={subscribers} alerts={alerts} />
}
