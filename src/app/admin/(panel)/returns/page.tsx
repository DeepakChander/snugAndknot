import { ReturnsAdmin } from '@/components/admin/OrdersAdmin'
import { listReturnsAdmin } from '@/server/repo/orders'
import { requireAdminPage } from '@/server/guards'

export const metadata = { title: 'Returns' }

export default async function AdminReturns() {
  await requireAdminPage()
  return <ReturnsAdmin returns={await listReturnsAdmin()} />
}
