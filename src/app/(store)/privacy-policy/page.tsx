import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import LegalView from '@/components/content/LegalView'
import { getStoreSettings } from '@/server/catalog'
import { privacySections } from '@/lib/legal'

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getStoreSettings(), { title: 'Privacy policy', description: 'What Snug&Knot collects when you shop, why, how long it is kept and the choices you have.', path: '/privacy-policy' })
}

export default async function PrivacyPage() {
  const settings = await getStoreSettings()
  return <LegalView eyebrow="Legal" title="Privacy *policy*" intro="What we collect, why, and the choices you have." sections={privacySections(settings)} />
}
