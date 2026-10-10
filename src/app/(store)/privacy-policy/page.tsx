import type { Metadata } from 'next'
import LegalView from '@/components/content/LegalView'
import { getStoreSettings } from '@/server/catalog'
import { privacySections } from '@/lib/legal'

export const metadata: Metadata = { title: 'Privacy policy' }

export default async function PrivacyPage() {
  const settings = await getStoreSettings()
  return <LegalView eyebrow="Legal" title="Privacy policy" intro="What we collect, why, and the choices you have." sections={privacySections(settings)} />
}
