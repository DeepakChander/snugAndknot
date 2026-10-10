import type { Metadata } from 'next'
import CartView from '@/components/checkout/CartView'
import { getProducts } from '@/server/catalog'

export const metadata: Metadata = { title: 'Your bag', robots: { index: false } }

export default async function CartPage() {
  const suggestions = await getProducts({ sort: 'featured', limit: 4 })
  return <CartView suggestions={suggestions} />
}
