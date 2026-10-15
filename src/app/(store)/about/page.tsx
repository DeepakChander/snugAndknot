import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import AboutView from '@/components/content/AboutView'
import { getStoreSettings } from '@/server/catalog'

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getStoreSettings(), { title: 'Our story', description: 'Snug&Knot was born from a simple belief: that the clothes we wear should feel as good as they look.', path: '/about' })
}

export default async function AboutPage() {
  const { store } = await getStoreSettings()
  return <AboutView storeName={store.name} />
}
