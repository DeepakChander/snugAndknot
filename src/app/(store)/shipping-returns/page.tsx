import type { Metadata } from 'next'
import { ShippingView } from '@/components/content/ServiceViews'

export const metadata: Metadata = { title: 'Shipping & returns', description: 'Delivery options, costs and how to return a Snug&Knot piece.' }

export default function ShippingPage() {
  return <ShippingView />
}
