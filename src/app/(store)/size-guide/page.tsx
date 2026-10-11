import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import { getStoreSettings } from '@/server/catalog'
import { SizeGuideView } from '@/components/content/ServiceViews'

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getStoreSettings(), { title: 'Size guide', description: 'Body measurements for every Snug&Knot size.', path: '/size-guide' })
}

export default function SizeGuidePage() {
  return <SizeGuideView />
}
