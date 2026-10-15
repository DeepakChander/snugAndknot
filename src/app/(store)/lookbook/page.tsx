import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import LookbookView, { type Spread } from '@/components/content/LookbookView'
import lookbook from '@/data/lookbook.json'
import { getProducts, getStoreSettings } from '@/server/catalog'

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getStoreSettings(), { title: 'Lookbook', description: 'Four chapters in Snug&Knot knitwear — the cold months, by the water, every day, and finished by hand.', path: '/lookbook' })
}

type Chapter = Omit<Spread, 'pieces'> & { products: string[] }

export default async function LookbookPage() {
  const products = await getProducts({})
  const byHandle = new Map(products.map((p) => [p.handle, p]))
  // A chapter only lists pieces that are still in the shop.
  const spreads: Spread[] = (lookbook as Chapter[]).map(({ products: handles, ...chapter }) => ({
    ...chapter,
    pieces: handles.flatMap((h) => {
      const p = byHandle.get(h)
      return p ? [{ handle: p.handle, title: p.title, price: p.price, compareAtPrice: p.compareAtPrice, prices: p.prices, image: p.images[0]?.src ?? '' }] : []
    }),
  }))
  return <LookbookView spreads={spreads} />
}
