import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import { getStoreSettings } from '@/server/catalog'
import { CareView } from '@/components/content/ServiceViews'

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getStoreSettings(), { title: 'Care guide', description: 'How to wash, dry and store your clothes so they keep their shape and colour.', path: '/care-instructions' })
}

export default function CarePage() {
  return <CareView />
}
