import type { Metadata } from 'next'
import ShopView from '@/components/shop/ShopView'
import { loadShop } from '@/server/shop'

export const metadata: Metadata = {
  alternates: { canonical: '/shop' },
  title: 'Shop all knitwear',
  description: 'Every Snug&Knot piece — cardigans and fine-gauge knit tees in merino, cashmere blends and long-staple cotton.',
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const data = await loadShop({ activeHref: '/shop' }, await searchParams)
  return (
    <ShopView
      eyebrow="Shop"
      title="All pieces"
      description="A short list of knits, made slowly in small runs — natural fibres, honest construction, finished by hand."
      {...data}
    />
  )
}
