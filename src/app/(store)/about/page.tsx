import type { Metadata } from 'next'
import AboutView from '@/components/content/AboutView'
import { getStoreSettings } from '@/server/catalog'

export const metadata: Metadata = { title: 'Our story', description: 'Snug&Knot makes knitwear from natural fibres, in small runs, finished by hand.', alternates: { canonical: '/about' } }

const VALUES = ['Natural fibres', 'Small runs', 'Finished by hand', 'Made to be worn for years', 'Care notes with every piece']

export default async function AboutPage() {
  const { store } = await getStoreSettings()
  return <AboutView values={VALUES} storeName={store.name} />
}
