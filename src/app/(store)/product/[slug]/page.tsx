import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import FabricGallery from '@/components/product/FabricGallery'
import ProductInfo from '@/components/product/ProductInfo'
import Reviews from '@/components/product/Reviews'
import { FabricStory, RecentlyViewed, Related, StickyBuyBar } from '@/components/product/ProductExtras'
import { getProduct, getRelated, getReviews, getStoreSettings } from '@/server/catalog'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbLd, metaDescription, productLd } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [product, { store }] = await Promise.all([getProduct((await params).slug), getStoreSettings()])
  if (!product) return { title: 'Piece not found' }
  const description = metaDescription(product.seoDescription || product.description)
  const path = `/product/${product.handle}`
  const images = product.images.slice(0, 4).map((i) => ({ url: i.src, alt: i.alt || product.title }))
  return {
    title: product.seoTitle || product.title,
    description,
    alternates: { canonical: path },
    // A page's openGraph replaces the layout's whole block, so it carries the site name too.
    openGraph: { type: 'website', siteName: store.name, locale: 'en_US', url: path, title: product.title, description, images },
    twitter: { card: 'summary_large_image', title: product.title, description, images },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()
  const [{ reviews, summary }, related, settings] = await Promise.all([getReviews(product.id), getRelated(product.handle, 4), getStoreSettings()])

  const structured = [
    productLd(product, summary, reviews, settings),
    breadcrumbLd([
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/shop' },
      { name: product.title, path: `/product/${product.handle}` },
    ]),
  ]

  const detailImage = product.images[1]?.src ?? product.images[0]?.src ?? ''

  return (
    <>
      <JsonLd data={structured} />
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
