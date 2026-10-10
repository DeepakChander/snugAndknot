import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import FabricGallery from '@/components/product/FabricGallery'
import ProductInfo from '@/components/product/ProductInfo'
import Reviews from '@/components/product/Reviews'
import { FabricStory, RecentlyViewed, Related, StickyBuyBar } from '@/components/product/ProductExtras'
import { getProduct, getRelated, getReviews, getStoreSettings } from '@/server/catalog'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug)
  if (!product) return { title: 'Piece not found' }
  const description = product.seoDescription || product.description.slice(0, 155)
  return {
    title: product.seoTitle || product.title,
    description,
    openGraph: { title: product.title, description, images: product.images.slice(0, 1).map((i) => ({ url: i.src, alt: i.alt })) },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()
  const [{ reviews, summary }, related, settings] = await Promise.all([getReviews(product.id), getRelated(product.handle, 4), getStoreSettings()])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.map((i) => i.src),
    sku: product.variants[0]?.sku,
    brand: { '@type': 'Brand', name: settings.store.name },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: settings.commerce.currency,
      lowPrice: Math.min(...product.variants.map((v) => v.price)),
      highPrice: Math.max(...product.variants.map((v) => v.price)),
      offerCount: product.variants.length,
      availability: product.variants.some((v) => v.available) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    // Only real, approved reviews — never a placeholder rating.
    ...(summary.count > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: summary.average, reviewCount: summary.count } } : {}),
  }

  const detailImage = product.images[1]?.src ?? product.images[0]?.src ?? ''

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className="bg-ivory pb-20 pt-nav text-ink">
        <div className="container-wide grid gap-10 pt-8 md:pt-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16 xl:gap-24">
          <FabricGallery images={product.images} title={product.title} />
          <div id="buy-panel" className="lg:pt-6">
            <ProductInfo product={product} summary={summary} />
          </div>
        </div>
      </section>
      <FabricStory details={product.details} image={detailImage} title={product.title} />
      <Reviews handle={product.handle} productTitle={product.title} initialReviews={reviews} initialSummary={summary} />
      <Related products={related} />
      <RecentlyViewed current={product.handle} />
      <StickyBuyBar title={product.title} price={product.price} image={product.images[0]?.src ?? ''} targetId="buy-panel" />
    </>
  )
}
