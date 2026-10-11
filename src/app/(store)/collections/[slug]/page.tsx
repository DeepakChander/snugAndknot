import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CollectionDetail from '@/components/collections/CollectionDetail'
import { getCollection, getCollections, getProducts, getStoreSettings } from '@/server/catalog'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbLd, itemListLd, metaDescription } from '@/lib/seo'
import { absoluteUrl } from '@/lib/site'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [collection, { store }] = await Promise.all([getCollection((await params).slug), getStoreSettings()])
  if (!collection) return { title: 'Collection not found' }
  const path = `/collections/${collection.handle}`
  const description = metaDescription(collection.description)
  const images = collection.image ? [{ url: absoluteUrl(collection.image), alt: `${collection.title} collection` }] : undefined
  return {
    title: collection.title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', siteName: store.name, locale: 'en_US', url: path, title: collection.title, description, images },
    twitter: { card: 'summary_large_image', title: collection.title, description, images },
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
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Collections', path: '/collections' }, { name: collection.title, path: `/collections/${collection.handle}` }]),
          itemListLd(collection.title, products),
        ]}
      />
      <CollectionDetail collection={collection} products={products} others={all.filter((c) => c.id !== collection.id)} />
    </>
  )
}
