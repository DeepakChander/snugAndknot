import { notFound } from 'next/navigation'
import { OrderDetail } from '@/components/account/AccountViews'
import { currentUser } from '@/server/auth'
import { getOrderById, listReturnsForUser } from '@/server/repo/orders'
import { getSettings } from '@/server/repo/settings'

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = (await currentUser())!
  const order = await getOrderById((await params).id)
  if (!order || (order.userId !== user.id && order.email.toLowerCase() !== user.email.toLowerCase())) notFound()
  const [settings, returns] = await Promise.all([getSettings(), listReturnsForUser(user.id)])
  const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt).getTime() : null
  const windowOpen = order.status === 'delivered' && deliveredAt !== null && Date.now() - deliveredAt <= settings.commerce.returnWindowDays * 86400_000
  return <OrderDetail order={order} returnWindowOpen={windowOpen} returns={returns.filter((r) => r.orderId === order.id)} />
}
