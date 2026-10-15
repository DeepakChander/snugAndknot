import HomeHero from '@/components/home/premium/HomeHero'
import CategoryCards, { type HomeCard } from '@/components/home/premium/CategoryCards'
import FeatureStrip from '@/components/home/premium/FeatureStrip'
import NewArrivals from '@/components/home/premium/NewArrivals'
import StorySplit from '@/components/home/premium/StorySplit'
import SeasonBanner from '@/components/home/premium/SeasonBanner'
import VideoWall from '@/components/home/VideoWall'
import type { Metadata } from 'next'
import { getCategories, getProducts, getStoreSettings } from '@/server/catalog'
import JsonLd from '@/components/seo/JsonLd'
import { organizationLd, websiteLd } from '@/lib/seo'
import { buildWall } from '@/lib/video'
import type { Product } from '@/types/commerce'

export const metadata: Metadata = { alternates: { canonical: '/', types: { 'application/rss+xml': [{ url: '/journal/feed.xml', title: 'Snug&Knot Journal' }] } } }

const DEPARTMENTS = [
  ['men', 'Men'],
  ['women', 'Women'],
  ['kids', 'Kids'],
] as const

/**
 * Home: a photograph hero, department and category cards, the promise strip, the newest pieces, the
 * brand story and a seasonal banner. Every word and photograph comes from Admin → Settings → Home page;
 * the cards follow the catalogue (departments with pieces, then categories marked for the home page).
 */
export default async function HomePage() {
  const [products, categories, settings] = await Promise.all([getProducts({ sort: 'featured' }), getCategories(), getStoreSettings()])
  const home = settings.homepage
  // A card without its own photograph takes one from its pieces, never one another card already shows.
  const used = new Set<string>()
  // Main photographs first (a different piece reads better than another shot of the same one).
  const firstImage = (list: Product[]) =>
    [...list.map((p) => p.images[0]?.src), ...list.flatMap((p) => p.images.slice(1).map((i) => i.src))].find((src) => src && !used.has(src)) ?? ''
  const take = (src: string) => {
    if (src) used.add(src)
    return src
  }

  const cards: HomeCard[] = []
  for (const [id, label] of DEPARTMENTS) {
    const list = products.filter((p) => p.gender === id || (id !== 'kids' && p.gender === 'unisex'))
    if (list.length) cards.push({ label, href: `/shop/${id}`, image: take(home.departmentImages[id] || firstImage(list)) })
  }
  // getCategories lists only categories with active pieces. A cached read from before the
  // badge/showOnHome columns lacks both, so missing means "shown, no badge".
  for (const c of categories.filter((c) => c.showOnHome !== false)) {
    cards.push({ label: c.title, href: `/shop/${c.slug}`, image: take(c.image && !used.has(c.image) ? c.image : firstImage(products.filter((p) => p.category === c.slug)) || c.image), badge: c.badge || undefined })
  }

  const newest = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  // Video wall: nothing renders until the admin switches it on with at least one playable clip.
  const wall = settings.videos.enabled ? buildWall(settings.videos.items, products) : []

  return (
    <>
      <JsonLd data={[organizationLd(settings), websiteLd(settings)]} />
      <HomeHero home={home} storeName={settings.store.name} />
      <CategoryCards cards={cards} />
      <FeatureStrip features={home.features} />
      <NewArrivals products={newest} />
      <StorySplit home={home} />
      <SeasonBanner home={home} />
      {wall.length ? <VideoWall heading={settings.videos.heading} intro={settings.videos.intro} ctaLabel={settings.videos.ctaLabel} ctaHref={settings.videos.ctaHref} items={wall} /> : null}
    </>
  )
}
