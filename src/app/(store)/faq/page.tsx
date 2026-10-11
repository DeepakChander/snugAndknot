import type { Metadata } from 'next'
import FaqView from '@/components/content/FaqView'
import { getStoreSettings } from '@/server/catalog'
import { faqGroups } from '@/lib/faq'
import JsonLd from '@/components/seo/JsonLd'
import { faqLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Questions & answers',
  description: 'Ordering, shipping, sizing, returns and accounts at Snug&Knot.',
  alternates: { canonical: '/faq' },
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
