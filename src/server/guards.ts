import 'server-only'
import { redirect } from 'next/navigation'
import { currentUser } from './auth'
import type { PublicUser } from '@/types/commerce'

/**
 * Every admin page calls this itself. A check in the shared layout alone is not enough: a
 * client navigation can ask the server for just the page segment, and the layout does not
 * run again for that request.
 */
export async function requireAdminPage(): Promise<PublicUser> {
  const user = await currentUser()
  if (!user) redirect('/admin/login')
  if (user.role !== 'admin') redirect('/admin/login?denied=1')
  return user
}
