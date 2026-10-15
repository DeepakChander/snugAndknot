import { OrdersList } from '@/components/admin/OrdersAdmin'
import { listOrdersAdmin } from '@/server/repo/orders'
import { requireAdminPage } from '@/server/guards'
import { sweepUnpaidOrders } from '@/server/payments'
import { after } from 'next/server'

export const metadata = { title: 'Orders' }

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdminPage()
  // Releases expired online-payment holds; the next visit shows the result.
  after(sweepUnpaidOrders)
  const [{ status }, orders] = await Promise.all([searchParams, listOrdersAdmin({ limit: 500 })])
  return <OrdersList orders={orders} initialStatus={status ?? 'all'} />
}
