import { Profile } from '@/components/account/AccountViews'
import { currentUser } from '@/server/auth'

export default async function ProfilePage() {
  const user = await currentUser()
  // The account layout shows the sign-in screen; render nothing here without a session.
  if (!user) return null
  return <Profile user={user} />
}
