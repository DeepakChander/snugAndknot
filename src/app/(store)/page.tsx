import WordmarkHero from '@/components/home/WordmarkHero'
import MaterialRows from '@/components/home/MaterialRows'
import NewInRing from '@/components/home/NewInRing'
import CollectionSheets from '@/components/home/CollectionSheets'
import ShopIndex, { type IndexRow } from '@/components/home/ShopIndex'
import Statement from '@/components/home/Statement'
import CraftCards from '@/components/home/CraftCards'
import ClientReviews from '@/components/home/ClientReviews'
import JournalCards from '@/components/home/JournalCards'
import Promises from '@/components/home/Promises'
import type { Metadata } from 'next'
import { getCategories, getCollections, getLatestReviews, getProducts, getStoreSettings } from '@/server/catalog'
import JsonLd from '@/components/seo/JsonLd'
import { organizationLd, websiteLd } from '@/lib/seo'
import { JOURNAL } from '@/lib/journal'
import type { Product } from '@/types/commerce'

/** Knitwear-only editorial frames that join the garments in the hero's flip-book. */
const LOOKS = [
  '/images/lookbook/soft-focus-2.png',
  '/images/lookbook/quiet-luxury-1.png',
  '/images/Collections-Hero/Winter.png',
  '/images/Collections-Hero/Essentials.png',
  '/images/Collections-Hero/Coastal.png',
]
const COVER = '/images/collection-home/Material-Intimacy.png'

export const metadata: Metadata = { alternates: { canonical: '/', types: { 'application/rss+xml': [{ url: '/journal/feed.xml', title: 'Snug&Knot Journal' }] } } }

const pieces = (n: number) => `${n} piece${n === 1 ? '' : 's'}`

export default async function HomePage() {
  const [products, collections, categories, latest, settings] = await Promise.all([
    getProducts({ sort: 'featured' }),
    getCollections(),
    getCategories(),
    getLatestReviews(6),
    getStoreSettings(),
  ])

  // Flip-book: alternate real garments with editorial frames.
  const garments = products.flatMap((p) => p.images.slice(0, 2).map((i) => i.src))
  const frames: string[] = []
  for (let i = 0; i < Math.max(garments.length, LOOKS.length); i++) {
    if (garments[i]) frames.push(garments[i])
    if (LOOKS[i]) frames.push(LOOKS[i])
  }

  // "Shop by": departments that have pieces, then the active categories, then everything.
  const forDept = (d: 'women' | 'men' | 'kids') =>
    products.filter((p) => p.gender === d || (d !== 'kids' && p.gender === 'unisex'))
  const firstImage = (list: Product[], fallback: string) => list.find((p) => p.images[0])?.images[0].src ?? fallback
  const rows: IndexRow[] = []
  for (const [id, label] of [['women', 'Women'], ['men', 'Men'], ['kids', 'Kids']] as const) {
    const list = forDept(id)
    if (list.length) rows.push({ label, href: `/shop/${id}`, meta: pieces(list.length), image: firstImage(list, LOOKS[0]) })
  }
  for (const c of categories) {
    const list = products.filter((p) => p.category === c.slug)
    rows.push({ label: c.title, href: `/shop/${c.slug}`, meta: pieces(c.productCount), image: c.image || firstImage(list, LOOKS[1]) })
  }
  rows.push({ label: 'All pieces', href: '/shop', meta: pieces(products.length), image: LOOKS[2] })

  return (
    <>
      <JsonLd data={[organizationLd(settings), websiteLd(settings)]} />
      <WordmarkHero frames={frames.slice(0, 14)} cover={COVER} />
      <MaterialRows />
      <NewInRing products={products.slice(0, 8)} />
      <CollectionSheets collections={collections} products={products} />
      <ShopIndex rows={rows} />
      <Statement />
      <CraftCards />
      <ClientReviews reviews={latest.reviews} average={latest.average} count={latest.count} />
      <JournalCards posts={JOURNAL} />
      <Promises />
    </>
  )
}
