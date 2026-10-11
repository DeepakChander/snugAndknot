import type { Metadata } from 'next'
import Confirmation from '@/components/checkout/Confirmation'

export const metadata: Metadata = { title: 'Order confirmed', robots: { index: false } }

export default async function ConfirmedPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams
  return <Confirmation orderNumber={(order ?? '').slice(0, 40)} />
}
