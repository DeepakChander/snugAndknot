import { InboxAdmin } from '@/components/admin/PeopleAdmin'
import { listMessages, listStockAlerts, listSubscribers } from '@/server/repo/misc'

export const metadata = { title: 'Inbox' }

export default async function AdminInbox() {
  const [messages, subscribers, alerts] = await Promise.all([listMessages(), listSubscribers(), listStockAlerts()])
  return <InboxAdmin messages={messages} subscribers={subscribers} alerts={alerts} />
}
