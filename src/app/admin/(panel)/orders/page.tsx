import { OrdersList } from '@/components/admin/OrdersAdmin'
import { listOrdersAdmin } from '@/server/repo/orders'

export const metadata = { title: 'Orders' }

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const [{ status }, orders] = await Promise.all([searchParams, listOrdersAdmin({ limit: 500 })])
  return <OrdersList orders={orders} initialStatus={status ?? 'all'} />
}
