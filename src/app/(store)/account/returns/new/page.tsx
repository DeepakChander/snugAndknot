import { NewReturn } from '@/components/account/AccountViews'
import { currentUser } from '@/server/auth'
import { listOrdersForUser } from '@/server/repo/orders'
import { getSettings } from '@/server/repo/settings'

export default async function NewReturnPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const user = await currentUser()
  // The account layout shows the sign-in screen; render nothing here without a session.
  if (!user) return null
  const [orders, settings] = await Promise.all([listOrdersForUser(user.id), getSettings()])
  const days = settings.commerce.returnWindowDays
  const eligible = orders.filter((o) => o.status === 'delivered' && o.deliveredAt && Date.now() - new Date(o.deliveredAt).getTime() <= days * 86400_000)
  return <NewReturn orders={eligible} initialOrderId={(await searchParams).order ?? null} />
}
