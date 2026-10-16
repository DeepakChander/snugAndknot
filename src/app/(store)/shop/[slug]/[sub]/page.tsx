import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ShopView from '@/components/shop/ShopView'
import { DEPARTMENTS, loadShop } from '@/server/shop'
import { getCategories, getCategory, getStoreSettings } from '@/server/catalog'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbLd, itemListLd, pageMeta } from '@/lib/seo'
import { categoryFullTitle, categoryHref, isDepartment, openDepartments } from '@/lib/categories'

type Props = {
  params: Promise<{ slug: string; sub: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** /shop/men/shirts → the category "men-shirts", only when it really belongs to that department. */
async function resolve(params: Props['params']) {
  const { slug, sub } = await params
  if (!isDepartment(slug)) return null
  // A department the admin closed has no pages.
  if (!openDepartments((await getStoreSettings()).store).includes(slug)) return null
  const category = await getCategory(`${slug}-${sub}`)
  return category && category.department === slug ? category : null
}

/** Whether the category has any active pieces yet (the menu lists empty ones too). */
async function hasPieces(slug: string) {
  return (await getCategories()).some((c) => c.slug === slug)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [category, settings] = await Promise.all([resolve(params), getStoreSettings()])
  if (!category) return { title: 'Not found' }
  const title = categoryFullTitle(category)
  // An empty category is a "coming soon" note: kept out of the index until it has pieces (the sitemap adds it then).
  const empty = !(await hasPieces(category.slug))
  return pageMeta(settings, {
    title,
    description: category.description || `${title} at ${settings.store.name}.`,
    path: categoryHref(category),
    robots: empty ? { index: false, follow: true } : undefined,
  })
}

export default async function DepartmentCategoryPage({ params, searchParams }: Props) {
  const category = await resolve(params)
  if (!category || !category.department) notFound()
  const dept = DEPARTMENTS[category.department]
  const href = categoryHref(category)
  const [data, stocked] = await Promise.all([loadShop({ category: category.slug, department: category.department, activeHref: href }, await searchParams), hasPieces(category.slug)])
  const title = categoryFullTitle(category)
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            { name: dept.title, path: `/shop/${category.department}` },
            { name: category.title, path: href },
          ]),
          itemListLd(title, data.products),
        ]}
      />
      <ShopView
        eyebrow={`Shop / ${dept.title}${category.group ? ` / ${category.group}` : ''}`}
        title={title}
        description={category.description}
        {...data}
        comingSoon={stocked ? undefined : { title: `${title} are coming soon.`, body: 'We are adding pieces to this category. Leave your email and we will tell you the day they arrive.' }}
      />
    </>
  )
}
