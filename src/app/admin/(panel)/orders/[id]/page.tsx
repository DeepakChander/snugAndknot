import { notFound } from 'next/navigation'
import { OrderDetailAdmin } from '@/components/admin/OrdersAdmin'
import { getOrderById } from '@/server/repo/orders'

export const metadata = { title: 'Order' }

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const order = await getOrderById((await params).id)
  if (!order) notFound()
  return <OrderDetailAdmin key={order.status + order.paymentStatus + (order.trackingNumber ?? '')} order={order} />
}
