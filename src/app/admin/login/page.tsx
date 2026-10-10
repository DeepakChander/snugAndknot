import type { Metadata } from 'next'
import AdminLogin from '@/components/admin/AdminLogin'
import { adminLoginConfigured } from '@/server/auth'

export const metadata: Metadata = { title: 'Admin sign in', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const { denied } = await searchParams
  return <AdminLogin configured={adminLoginConfigured()} denied={denied === '1'} />
}
