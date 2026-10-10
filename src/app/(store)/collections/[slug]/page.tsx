import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CollectionDetail from '@/components/collections/CollectionDetail'
import { getCollection, getCollections, getProducts } from '@/server/catalog'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = await getCollection((await params).slug)
  if (!collection) return { title: 'Collection not found' }
  return {
    title: collection.title,
    description: collection.description,
    openGraph: { images: collection.image ? [{ url: collection.image }] : undefined },
  }
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params
  const collection = await getCollection(slug)
  if (!collection) notFound()
  const [products, all] = await Promise.all([
    collection.productIds.length ? getProducts({ ids: collection.productIds }) : Promise.resolve([]),
    getCollections(),
  ])
  return <CollectionDetail collection={collection} products={products} others={all.filter((c) => c.id !== collection.id)} />
}
