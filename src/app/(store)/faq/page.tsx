import type { Metadata } from 'next'
import FaqView from '@/components/content/FaqView'
import { getStoreSettings } from '@/server/catalog'
import { faqGroups } from '@/lib/faq'
import JsonLd from '@/components/seo/JsonLd'
import { faqLd, pageMeta } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getStoreSettings(), { title: 'Questions & answers', description: 'Ordering, shipping, sizing, returns and accounts at Snug&Knot.', path: '/faq' })
}

export default async function FaqPage() {
  const groups = faqGroups(await getStoreSettings())
  return (
    <>
      <JsonLd data={faqLd(groups)} />
      <FaqView groups={groups} />
    </>
  )
}
