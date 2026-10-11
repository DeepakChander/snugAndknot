import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import { getStoreSettings } from '@/server/catalog'
import { ShippingView } from '@/components/content/ServiceViews'

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getStoreSettings(), { title: 'Shipping & returns', description: 'Delivery options, costs and how to return a Snug&Knot piece.', path: '/shipping-returns' })
}

export default function ShippingPage() {
  return <ShippingView />
}
