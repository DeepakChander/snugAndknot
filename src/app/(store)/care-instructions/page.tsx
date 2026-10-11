import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import { getStoreSettings } from '@/server/catalog'
import { CareView } from '@/components/content/ServiceViews'

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getStoreSettings(), { title: 'Caring for knitwear', description: 'How to wash, dry and store merino, cashmere blends and cotton–silk knits.', path: '/care-instructions' })
}

export default function CarePage() {
  return <CareView />
}
