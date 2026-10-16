import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import FabricGallery from '@/components/product/FabricGallery'
import ProductInfo from '@/components/product/ProductInfo'
import Reviews from '@/components/product/Reviews'
import { RecentlyViewed, Related, StickyBuyBar } from '@/components/product/ProductExtras'
import { getProduct, getProducts, getRelated, getReviews, getStoreSettings } from '@/server/catalog'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbLd, pageMeta, productLd, socialImage } from '@/lib/seo'
import { DEPARTMENTS } from '@/server/shop'

type Props = { params: Promise<{ slug: string }> }

// Served from the edge cache and refreshed every five minutes (admin edits refresh it at once).
export const revalidate = 300

export async function generateStaticParams() {
  return (await getProducts({})).map((p) => ({ slug: p.handle }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [product, settings] = await Promise.all([getProduct((await params).slug), getStoreSettings()])
  if (!product) return { title: 'Piece not found' }
  const lead = product.images[0]
  return pageMeta(settings, {
    title: product.seoTitle || product.title,
    description: product.seoDescription || product.description,
    path: `/product/${product.handle}`,
    images: lead ? [socialImage(lead.src, lead.alt || product.title)] : undefined,
  })
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()
  const [{ reviews, summary }, related, settings] = await Promise.all([getReviews(product.id), getRelated(product.handle, 4), getStoreSettings()])

  const structured = [
    productLd(product, summary, reviews, settings),
    // The same trail the page shows: department pages are the hubs a shopper comes through.
    breadcrumbLd([
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/shop' },
      ...(product.gender !== 'unisex' ? [{ name: DEPARTMENTS[product.gender].title, path: `/shop/${product.gender}` }] : []),
      { name: product.title, path: `/product/${product.handle}` },
    ]),
  ]

  return (
    <>
      <JsonLd data={structured} />
      <section className="bg-ivory pb-20 pt-nav text-ink">
        <div className="container-wide grid gap-8 pt-4 md:pt-8 lg:grid-cols-[1.65fr_1fr] lg:gap-12 xl:gap-16">
          <FabricGallery images={product.images} title={product.title} />
          <div id="buy-panel" className="self-start lg:sticky lg:top-[calc(var(--nav-offset)+1.5rem)]">
            <ProductInfo product={product} summary={summary} />
          </div>
        </div>
      </section>
      <Reviews handle={product.handle} productTitle={product.title} initialReviews={reviews} initialSummary={summary} />
      <Related products={related} />
      <RecentlyViewed current={product.handle} />
      <StickyBuyBar title={product.title} product={{ price: product.price, compareAtPrice: product.compareAtPrice, prices: product.prices }} image={product.images[0]?.src ?? ''} targetId="buy-panel" />
    </>
  )
}
