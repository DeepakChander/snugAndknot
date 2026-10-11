import { notFound } from 'next/navigation'
import { OrderDetailAdmin } from '@/components/admin/OrdersAdmin'
import { getOrderAdmin } from '@/server/repo/orders'
import { requireAdminPage } from '@/server/guards'

export const metadata = { title: 'Order' }

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage()
  const order = await getOrderAdmin((await params).id)
  if (!order) notFound()
  return <OrderDetailAdmin key={order.status + order.paymentStatus + (order.trackingNumber ?? '')} order={order} />
}
