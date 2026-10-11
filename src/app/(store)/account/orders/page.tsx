import { OrdersList } from '@/components/account/AccountViews'
import { currentUser } from '@/server/auth'
import { listOrdersForUser } from '@/server/repo/orders'

export default async function OrdersPage() {
  const user = await currentUser()
  // The account layout shows the sign-in screen; render nothing here without a session.
  if (!user) return null
  return <OrdersList orders={await listOrdersForUser(user.id)} />
}
