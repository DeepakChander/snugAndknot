import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ShopView from '@/components/shop/ShopView'
import { DEPARTMENTS, loadShop } from '@/server/shop'
import { getCategory, getProducts, getStoreSettings } from '@/server/catalog'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbLd, itemListLd, pageMeta } from '@/lib/seo'

/** "Women's knitwear", "Kids' knitwear". */
const knitwear = (t: string) => `${t}${t.endsWith('s') ? "'" : "'s"} knitwear`

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function isDepartment(slug: string): slug is keyof typeof DEPARTMENTS {
  return slug in DEPARTMENTS
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  // Filters and sorting are query strings on the same page, so the canonical is the bare path.
  const settings = await getStoreSettings()
  if (isDepartment(slug)) {
    // A department with no pieces yet is a "coming soon" note: kept out of the index until it has some
    // (the sitemap adds it at the same moment).
    const empty = !(await getProducts({})).some((p) => p.gender === slug || (slug !== 'kids' && p.gender === 'unisex'))
    return pageMeta(settings, {
      title: knitwear(DEPARTMENTS[slug].title),
      description: DEPARTMENTS[slug].description,
      path: `/shop/${slug}`,
      robots: empty ? { index: false, follow: true } : undefined,
    })
  }
  const category = await getCategory(slug)
  return category ? pageMeta(settings, { title: category.title, description: category.description, path: `/shop/${slug}` }) : { title: 'Not found' }
}

export default async function ShopSegmentPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  if (isDepartment(slug)) {
    const dept = DEPARTMENTS[slug]
    const data = await loadShop({ gender: slug, activeHref: `/shop/${slug}` }, sp)
    return (
      <>
        <JsonLd
          data={[
            breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }, { name: dept.title, path: `/shop/${slug}` }]),
            itemListLd(knitwear(dept.title), data.products),
          ]}
        />
        <ShopView
          eyebrow={`Shop / ${dept.title}`}
          title={dept.title}
          description={dept.description}
          {...data}
          comingSoon={
            slug === 'kids'
              ? { title: 'The kids’ atelier opens soon.', body: 'Small knits in the same natural fibres are on the needles. Leave your email and we will tell you the day they arrive.' }
              : undefined
          }
        />
      </>
    )
  }

  const category = await getCategory(slug)
  if (!category) notFound()
  const data = await loadShop({ category: slug, activeHref: `/shop/${slug}` }, sp)
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Shop', path: '/shop' }, { name: category.title, path: `/shop/${slug}` }]),
          itemListLd(category.title, data.products),
        ]}
      />
      <ShopView eyebrow={`Shop / ${category.title}`} title={category.title} description={category.description} {...data} />
    </>
  )
}
