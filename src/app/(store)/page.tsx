import HomeHero, { type HeroPanelView } from '@/components/home/HomeHero'
import CategoryGrid, { type CategoryTile } from '@/components/home/CategoryGrid'
import NewIn from '@/components/home/NewIn'
import Collections from '@/components/home/Collections'
import HomeFeature from '@/components/home/HomeFeature'
import ClientReviews from '@/components/home/ClientReviews'
import VideoWall from '@/components/home/VideoWall'
import JournalCards from '@/components/home/JournalCards'
import Promises from '@/components/home/Promises'
import type { Metadata } from 'next'
import { getAllCategories, getCollections, getLatestReviews, getProducts, getStoreSettings } from '@/server/catalog'
import JsonLd from '@/components/seo/JsonLd'
import { organizationLd, websiteLd } from '@/lib/seo'
import { JOURNAL } from '@/lib/journal'
import { buildWall } from '@/lib/video'
import type { HomeSections, Product } from '@/types/commerce'
import { categoryHref, openDepartments, type Department } from '@/lib/categories'

export const metadata: Metadata = { alternates: { canonical: '/', types: { 'application/rss+xml': [{ url: '/journal/feed.xml', title: 'Snug&Knot Journal' }] } } }

/**
 * The home page, top to bottom: hero, Shop by category, New in, the campaign band, Collections, the video wall,
 * customer reviews, Journal and the service promises. Each section after the hero can be switched
 * off in Admin → Settings → Home page (the video wall under Video wall); each also stays out of the
 * page on its own while it has nothing to show.
 */
export default async function HomePage() {
  const [products, collections, allCategories, latest, settings] = await Promise.all([
    getProducts({ sort: 'featured' }),
    getCollections(),
    getAllCategories(),
    getLatestReviews(6),
    getStoreSettings(),
  ])
  // A setting saved before the switches existed has none: every section shows.
  const on = (k: keyof HomeSections) => settings.homepage.sections?.[k] ?? true
  const open = openDepartments(settings.store)

  const forDept = (d: Department) => products.filter((p) => p.gender === d || (d !== 'kids' && p.gender === 'unisex'))
  const firstImage = (list: Product[]) => list.find((p) => p.images[0])?.images[0].src ?? ''

  // Hero panels from the admin, in order. A panel with no photograph of its own that links to a
  // department shows one of that department's pieces; a panel with no photograph at all is left out
  // (so Kids appears once it has one).
  const department = (href: string) => /^\/shop\/(men|women|kids)\/?$/.exec(href)?.[1] as Department | undefined
  const heroPanels: HeroPanelView[] = (settings.homepage.heroPanels ?? [])
    .filter((p) => p.label.trim() && p.href)
    // A panel for a closed department goes with it.
    .filter((p) => !department(p.href) || open.includes(department(p.href)!))
    .map((p) => {
      const d = department(p.href)
      return { label: p.label, href: p.href, image: p.image || (d ? firstImage(forDept(d)) : '') }
    })
    // Over a campaign photograph the panels are only links, so they need no photograph of their own.
    .filter((p) => p.image || settings.homepage.heroImage)

  // The campaign band: the chosen collection, while it exists and there is a photograph for it, with
  // its pieces that are on sale.
  const feature = settings.homepage.feature
  const featured = feature?.enabled ? collections.find((c) => c.handle === feature.collectionHandle && (feature.image || c.image)) : undefined
  const featuredPieces = featured ? featured.productIds.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p) : []

  // "Shop by category": each department's categories that the admin left on the home page, in admin
  // order (empty ones included: their page says what is coming). One without a photograph yet shows
  // as its name; a Kids category is named with its group ("Boys T-shirts").
  const tiles: CategoryTile[] = allCategories
    .filter((c) => c.department && open.includes(c.department as Department) && c.showOnHome)
    .map((c) => ({
      slug: c.slug,
      href: categoryHref(c),
      title: c.department === 'kids' && c.group ? `${c.group} ${c.title}` : c.title,
      badge: c.badge,
      image: c.image,
      department: c.department as Department,
    }))

  const newest = [...products].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 8)

  // Video wall: nothing renders until the admin switches it on with at least one playable clip.
  const wall = settings.videos.enabled ? buildWall(settings.videos.items, products) : []

  return (
    <>
      <JsonLd data={[organizationLd(settings), websiteLd(settings)]} />
      <HomeHero home={settings.homepage} storeName={settings.store.name} panels={heroPanels} />
      {on('categories') ? <CategoryGrid tiles={tiles} /> : null}
      {on('newIn') ? <NewIn products={newest} /> : null}
      {feature && featured ? <HomeFeature feature={feature} collection={featured} pieces={featuredPieces} /> : null}
      {on('collections') ? <Collections collections={collections} products={products} /> : null}
      {wall.length ? <VideoWall heading={settings.videos.heading} intro={settings.videos.intro} ctaLabel={settings.videos.ctaLabel} ctaHref={settings.videos.ctaHref} items={wall} tabs departments={open} /> : null}
      {on('reviews') ? <ClientReviews reviews={latest.reviews} average={latest.average} count={latest.count} /> : null}
      {on('journal') ? <JournalCards posts={JOURNAL} /> : null}
      {on('promises') ? <Promises /> : null}
    </>
  )
}
