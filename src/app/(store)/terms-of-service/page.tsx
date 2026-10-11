import type { Metadata } from 'next'
import LegalView from '@/components/content/LegalView'
import { getStoreSettings } from '@/server/catalog'
import { termsSections } from '@/lib/legal'

export const metadata: Metadata = { title: 'Terms of service', description: 'The terms for using the Snug&Knot website and buying from us.', alternates: { canonical: '/terms-of-service' } }

export default async function TermsPage() {
  const settings = await getStoreSettings()
  return <LegalView eyebrow="Legal" title="Terms of *service*" intro="The terms for using this site and buying from us." sections={termsSections(settings)} />
}
