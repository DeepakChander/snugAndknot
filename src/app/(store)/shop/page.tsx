import type { Metadata } from 'next'
import { pageMeta } from '@/lib/seo'
import { getStoreSettings } from '@/server/catalog'
import ShopView from '@/components/shop/ShopView'
import { loadShop } from '@/server/shop'

export async function generateMetadata(): Promise<Metadata> {
  return pageMeta(await getStoreSettings(), { title: 'Shop all', description: 'Everyday clothing for men, women and kids at Snug&Knot.', path: '/shop' })
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const data = await loadShop({ activeHref: '/shop' }, await searchParams)
  return (
    <ShopView
      eyebrow="Shop"
      title="Shop all"
      description="Everything in the shop, for men, women and kids."
      {...data}
    />
  )
}
