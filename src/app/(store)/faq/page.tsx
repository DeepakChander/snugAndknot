import type { Metadata } from 'next'
import FaqView from '@/components/content/FaqView'
import { getStoreSettings } from '@/server/catalog'
import { faqGroups } from '@/lib/faq'

export const metadata: Metadata = { title: 'Questions & answers', description: 'Ordering, shipping, sizing, returns and accounts at Snug&Knot.' }

export default async function FaqPage() {
  return <FaqView groups={faqGroups(await getStoreSettings())} />
}
