import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import { getStoreSettings } from '@/server/catalog'
import { JournalIndex } from '@/components/content/JournalViews'
import { JOURNAL } from '@/lib/journal'

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getStoreSettings(), { title: 'Journal', description: 'Stories from Snug&Knot: fabrics, fit, care and the case for fewer, better things.', path: '/journal' })
}

export default function JournalPage() {
  return <JournalIndex posts={JOURNAL} />
}
