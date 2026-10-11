import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'
import { currentUser } from '@/server/auth'
import { dashboardStats } from '@/server/repo/misc'
import { getSettings } from '@/server/repo/settings'
import { getDb } from '@/server/db/client'

export const metadata: Metadata = { title: { default: 'Admin', template: '%s — Admin' }, robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser()
  if (!user) redirect('/admin/login')
  if (user.role !== 'admin') redirect('/admin/login?denied=1')
  const [stats, settings, db] = await Promise.all([dashboardStats(), getSettings(), getDb()])
  return (
    <AdminShell
      user={user}
      counts={{ awaitingFulfilment: stats.awaitingFulfilment, pendingReviews: stats.pendingReviews, newMessages: stats.newMessages, pendingReturns: stats.pendingReturns }}
      database={{ kind: db.kind, persistent: db.persistent }}
      settings={{ store: settings.store, commerce: settings.commerce, announcement: settings.announcement, homepage: settings.homepage, reviews: settings.reviews }}
    >
      {children}
    </AdminShell>
  )
}
