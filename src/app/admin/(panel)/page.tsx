import Dashboard from '@/components/admin/Dashboard'
import { currentUser } from '@/server/auth'
import { dashboardStats } from '@/server/repo/misc'
import { listOrdersAdmin } from '@/server/repo/orders'

export const metadata = { title: 'Dashboard' }

export default async function AdminHome() {
  const [user, stats, recent] = await Promise.all([currentUser(), dashboardStats(), listOrdersAdmin({ limit: 8 })])
  return <Dashboard stats={stats} recent={recent} userName={user?.name ?? 'there'} />
}
