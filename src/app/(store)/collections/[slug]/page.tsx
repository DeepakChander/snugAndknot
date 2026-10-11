import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CollectionDetail from '@/components/collections/CollectionDetail'
import { getCollection, getCollections, getProducts, getStoreSettings } from '@/server/catalog'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbLd, itemListLd, pageMeta, socialImage } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [collection, settings] = await Promise.all([getCollection((await params).slug), getStoreSettings()])
  if (!collection) return { title: 'Collection not found' }
  return pageMeta(settings, {
    title: collection.title,
    description: collection.description,
    path: `/collections/${collection.handle}`,
    images: collection.image ? [socialImage(collection.image, `${collection.title} collection`)] : undefined,
  })
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
