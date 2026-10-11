import Dashboard from '@/components/admin/Dashboard'
import { dashboardStats } from '@/server/repo/misc'
import { listOrdersAdmin } from '@/server/repo/orders'
import { requireAdminPage } from '@/server/guards'

export const metadata = { title: 'Dashboard' }

export default async function AdminHome() {
  const user = await requireAdminPage()
  const [stats, recent] = await Promise.all([dashboardStats(), listOrdersAdmin({ limit: 8 })])
  return <Dashboard stats={stats} recent={recent} userName={user.name} />
}
