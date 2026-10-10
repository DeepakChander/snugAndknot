import HomeHero from '@/components/home/HomeHero'
import MaterialsMarquee from '@/components/home/MaterialsMarquee'
import Manifesto from '@/components/home/Manifesto'
import TheEdit from '@/components/home/TheEdit'
import ShopByPanels from '@/components/home/ShopByPanels'
import CraftStack from '@/components/home/CraftStack'
import CollectionsFlythrough from '@/components/home/CollectionsFlythrough'
import ClientReviews from '@/components/home/ClientReviews'
import JournalTeaser from '@/components/home/JournalTeaser'
import Promises from '@/components/home/Promises'
import { getCollections, getLatestReviews, getProducts, getStoreSettings } from '@/server/catalog'
import { formatMoney } from '@/lib/format'
import { JOURNAL } from '@/lib/journal'
import type { RingItem } from '@/components/three/ProductRing'

const LOOKS: RingItem[] = [
  { src: '/images/lookbook/quiet-luxury-1.png', title: 'Quiet Luxury', subtitle: 'Lookbook', href: '/lookbook' },
  { src: '/images/lookbook/golden-hour-2.png', title: 'Golden Hour', subtitle: 'Lookbook', href: '/lookbook' },
  { src: '/images/lookbook/after-dark-1.png', title: 'After Dark', subtitle: 'Lookbook', href: '/lookbook' },
]

export default async function HomePage() {
  const [products, collections, settings, latest] = await Promise.all([
    getProducts({ sort: 'featured' }),
    getCollections(),
    getStoreSettings(),
    getLatestReviews(6),
  ])
  const { currency, locale } = settings.commerce

  const productItems: RingItem[] = products
    .filter((p) => p.images[0])
    .map((p) => ({
      src: p.images[0].src,
      title: p.title,
      subtitle: `${p.productType} — ${formatMoney(p.price, currency, locale)}`,
      href: `/product/${p.handle}`,
    }))
  const editorial: RingItem[] = [
    ...collections.filter((c) => c.image).map((c) => ({ src: c.image, title: c.title, subtitle: 'Collection', href: `/collections/${c.handle}` })),
    ...LOOKS,
  ]
  // Alternate garments with editorial frames so the rail always leads with a piece.
  const ring: RingItem[] = []
  for (let i = 0; i < Math.max(productItems.length, editorial.length); i++) {
    if (productItems[i]) ring.push(productItems[i])
    if (editorial[i]) ring.push(editorial[i])
  }

  return (
    <>
      <HomeHero items={ring.slice(0, 12)} />
      <MaterialsMarquee />
      <Manifesto />
      <TheEdit products={products.slice(0, 6)} />
      <ShopByPanels />
      <CraftStack />
      <CollectionsFlythrough collections={collections} />
      <ClientReviews reviews={latest.reviews} average={latest.average} count={latest.count} />
      <JournalTeaser posts={JOURNAL} />
      <Promises />
    </>
  )
}
