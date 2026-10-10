import { Overview } from '@/components/account/AccountViews'
import { currentUser } from '@/server/auth'
import { listOrdersForUser, listReturnsForUser } from '@/server/repo/orders'

export default async function AccountPage() {
  const user = (await currentUser())!
  const [orders, returns] = await Promise.all([listOrdersForUser(user.id, user.email), listReturnsForUser(user.id)])
  return <Overview user={user} orders={orders} openReturns={returns.filter((r) => r.status === 'pending' || r.status === 'approved').length} />
}
