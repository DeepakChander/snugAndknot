import type { Metadata } from 'next'
import AccountShell, { AccountGate } from '@/components/account/AccountShell'
import { currentUser } from '@/server/auth'

export const metadata: Metadata = { title: 'Your account', robots: { index: false } }

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  if (!user) return <AccountGate />
  return <AccountShell user={user}>{children}</AccountShell>
}
