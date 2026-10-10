import type { Metadata } from 'next'
import AboutView from '@/components/content/AboutView'
import { getStoreSettings } from '@/server/catalog'

export const metadata: Metadata = { title: 'Our story', description: 'Snug&Knot makes knitwear from natural fibres, in small runs, finished by hand.' }

const VALUES = ['Tension is not the enemy of softness', 'Every knot is a decision', 'Thread remembers what fingers forget', 'The loom does not rush', 'Where warp meets weft, intention lives']

export default async function AboutPage() {
  const { store } = await getStoreSettings()
  return <AboutView values={VALUES} storeName={store.name} />
}
