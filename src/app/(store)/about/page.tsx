import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import AboutView from '@/components/content/AboutView'
import { getStoreSettings } from '@/server/catalog'

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getStoreSettings(), { title: 'About us', description: 'Snug & Knot is a contemporary fashion brand built around a simple idea: style should feel effortless, personal, and enduring. Designed by us, made by us.', path: '/about' })
}

export default async function AboutPage() {
  const { store } = await getStoreSettings()
  return <AboutView storeName={store.name} />
}
