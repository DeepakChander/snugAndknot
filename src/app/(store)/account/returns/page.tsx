import { ReturnsList } from '@/components/account/AccountViews'
import { currentUser } from '@/server/auth'
import { listOrdersForUser, listReturnsForUser } from '@/server/repo/orders'
import { getSettings } from '@/server/repo/settings'

export default async function ReturnsPage() {
  const user = (await currentUser())!
  const [returns, orders, settings] = await Promise.all([listReturnsForUser(user.id), listOrdersForUser(user.id, user.email), getSettings()])
  const days = settings.commerce.returnWindowDays
  const eligible = orders.filter((o) => o.status === 'delivered' && o.deliveredAt && Date.now() - new Date(o.deliveredAt).getTime() <= days * 86400_000)
  return <ReturnsList returns={returns} eligible={eligible} />
}
