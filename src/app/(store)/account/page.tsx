import { Overview } from '@/components/account/AccountViews'
import { currentUser } from '@/server/auth'
import { listOrdersForUser, listReturnsForUser } from '@/server/repo/orders'

export default async function AccountPage() {
  const user = await currentUser()
  // The account layout shows the sign-in screen; render nothing here without a session.
  if (!user) return null
  const [orders, returns] = await Promise.all([listOrdersForUser(user.id), listReturnsForUser(user.id)])
  return <Overview user={user} orders={orders} openReturns={returns.filter((r) => r.status === 'pending' || r.status === 'approved').length} />
}
