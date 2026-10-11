import type { Metadata } from 'next'
import { TrackOrder } from '@/components/account/AccountViews'

export const metadata: Metadata = { title: 'Track an order', description: 'Track a Snug&Knot order with your order number and email.', robots: { index: false } }

export default async function TrackPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams
  return <TrackOrder initialNumber={(order ?? '').slice(0, 40)} />
}
