import type { Metadata } from 'next'
import { SizeGuideView } from '@/components/content/ServiceViews'

export const metadata: Metadata = { title: 'Size guide', description: 'Body measurements for every Snug&Knot size.', alternates: { canonical: '/size-guide' } }

export default function SizeGuidePage() {
  return <SizeGuideView />
}
