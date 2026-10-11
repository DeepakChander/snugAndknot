import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import AboutView from '@/components/content/AboutView'
import { getStoreSettings } from '@/server/catalog'

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getStoreSettings(), { title: 'Our story', description: 'Snug&Knot makes knitwear from natural fibres, in small runs, finished by hand.', path: '/about' })
}

const VALUES = ['Natural fibres', 'Small runs', 'Finished by hand', 'Made to be worn for years', 'Care notes with every piece']

export default async function AboutPage() {
  const { store } = await getStoreSettings()
  return <AboutView values={VALUES} storeName={store.name} />
}
