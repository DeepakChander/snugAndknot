import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import { getStoreSettings } from '@/server/catalog'
import ContactView from '@/components/content/ContactView'

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getStoreSettings(), { title: 'Contact', description: 'Write to Snug&Knot customer care.', path: '/contact' })
}

export default function ContactPage() {
  return <ContactView />
}
