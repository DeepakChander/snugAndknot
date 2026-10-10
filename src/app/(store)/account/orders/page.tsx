import { OrdersList } from '@/components/account/AccountViews'
import { currentUser } from '@/server/auth'
import { listOrdersForUser } from '@/server/repo/orders'

export default async function OrdersPage() {
  const user = (await currentUser())!
  return <OrdersList orders={await listOrdersForUser(user.id, user.email)} />
}
