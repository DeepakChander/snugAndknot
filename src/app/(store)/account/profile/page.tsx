import { Profile } from '@/components/account/AccountViews'
import { currentUser } from '@/server/auth'

export default async function ProfilePage() {
  const user = (await currentUser())!
  return <Profile user={user} />
}
