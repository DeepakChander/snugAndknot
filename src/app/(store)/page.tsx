import HomeHero from '@/components/home/HomeHero'
import type { CarouselItem } from '@/components/home/GarmentCarousel'
import CategoryGrid, { type CategoryTile } from '@/components/home/CategoryGrid'
import MaterialRows from '@/components/home/MaterialRows'
import NewInRing from '@/components/home/NewInRing'
import CollectionSheets from '@/components/home/CollectionSheets'
import ShopIndex, { type IndexRow } from '@/components/home/ShopIndex'
import Statement from '@/components/home/Statement'
import CraftCards from '@/components/home/CraftCards'
import ClientReviews from '@/components/home/ClientReviews'
import VideoWall from '@/components/home/VideoWall'
import JournalCards from '@/components/home/JournalCards'
import Promises from '@/components/home/Promises'
import type { Metadata } from 'next'
import { getCategories, getCollections, getLatestReviews, getProducts, getStoreSettings } from '@/server/catalog'
import JsonLd from '@/components/seo/JsonLd'
import { organizationLd, websiteLd } from '@/lib/seo'
import { JOURNAL } from '@/lib/journal'
import { buildWall } from '@/lib/video'
import type { Product } from '@/types/commerce'
import { categoryFullTitle, categoryHref } from '@/lib/categories'

/** Knitwear-only editorial frames, the fallback images for the "Shop by" index. */
const LOOKS = [
  '/images/lookbook/soft-focus-2.png',
  '/images/lookbook/quiet-luxury-1.png',
  '/images/Collections-Hero/Winter.png',
]

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
    rows.push({ label: categoryFullTitle(c), href: categoryHref(c), meta: pieces(c.productCount), image: c.image || firstImage(list, LOOKS[1]) })
  }
  rows.push({ label: 'All pieces', href: '/shop', meta: pieces(products.length), image: LOOKS[2] })

  // "Shop by category" tiles: categories with active pieces (getCategories) that the admin left on
  // the home page, in their admin order. A category without its own image shows one of its pieces.
  // A cached read from before the badge/showOnHome columns lacks both, so missing means "shown, no badge".
  const tiles: CategoryTile[] = categories
    .filter((c) => c.showOnHome !== false)
    .map((c) => ({
      slug: c.slug,
      href: categoryHref(c),
      title: categoryFullTitle(c),
      badge: c.badge ?? '',
      image: c.image || firstImage(products.filter((p) => p.category === c.slug), ''),
    }))

  // Hero carousel: the active pieces, two photographs each, so even a short catalogue makes a full ring.
  const withPhotos = products.filter((p) => p.images[0])
  const carousel: CarouselItem[] = [0, 1].flatMap((round) =>
    withPhotos.map((p) => {
      const img = p.images[round] ?? p.images[0]
      return {
        key: `${p.id}-${round}`,
        src: img.src,
        alt: img.alt || p.title,
        product: { id: p.id, handle: p.handle, title: p.title, productType: p.productType, price: p.price, compareAtPrice: p.compareAtPrice, prices: p.prices },
      }
    })
  ).slice(0, 10)

  // Video wall: nothing renders until the admin switches it on with at least one playable clip.
  const wall = settings.videos.enabled ? buildWall(settings.videos.items, products) : []

  return (
    <>
      <JsonLd data={[organizationLd(settings), websiteLd(settings)]} />
      <HomeHero home={settings.homepage} commerce={settings.commerce} storeName={settings.store.name} items={carousel} />
      <CategoryGrid tiles={tiles} />
      <MaterialRows />
      <NewInRing products={products.slice(0, 8)} />
      <CollectionSheets collections={collections} products={products} />
      <ShopIndex rows={rows} />
      <Statement />
      <CraftCards />
      <ClientReviews reviews={latest.reviews} average={latest.average} count={latest.count} />
      {wall.length ? <VideoWall heading={settings.videos.heading} intro={settings.videos.intro} ctaLabel={settings.videos.ctaLabel} ctaHref={settings.videos.ctaHref} items={wall} /> : null}
      <JournalCards posts={JOURNAL} />
      <Promises />
    </>
  )
}
