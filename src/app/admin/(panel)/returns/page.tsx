import { ReturnsAdmin } from '@/components/admin/OrdersAdmin'
import { listReturnsAdmin } from '@/server/repo/orders'

export const metadata = { title: 'Returns' }

export default async function AdminReturns() {
  return <ReturnsAdmin returns={await listReturnsAdmin()} />
}
