import { Rewards } from '@/components/account/AccountViews'
import { currentUser } from '@/server/auth'
import { listOrdersForUser } from '@/server/repo/orders'

export default async function RewardsPage() {
  const user = (await currentUser())!
  return <Rewards user={user} orders={await listOrdersForUser(user.id, user.email)} />
}
