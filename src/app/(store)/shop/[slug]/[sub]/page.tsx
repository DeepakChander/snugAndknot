import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ShopView from '@/components/shop/ShopView'
import { DEPARTMENTS, loadShop } from '@/server/shop'
import { getCategory, getStoreSettings } from '@/server/catalog'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbLd, itemListLd, pageMeta } from '@/lib/seo'
import { categoryFullTitle, categoryHref, isDepartment } from '@/lib/categories'

type Props = {
  params: Promise<{ slug: string; sub: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** /shop/men/shirts → the category "men-shirts", only when it really belongs to that department. */
async function resolve(params: Props['params']) {
  const { slug, sub } = await params
  if (!isDepartment(slug)) return null
  const category = await getCategory(`${slug}-${sub}`)
  return category && category.department === slug ? category : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [category, settings] = await Promise.all([resolve(params), getStoreSettings()])
  if (!category) return { title: 'Not found' }
  const title = categoryFullTitle(category)
  return pageMeta(settings, { title, description: category.description || `${title} at ${settings.store.name}.`, path: categoryHref(category) })
}

export default async function DepartmentCategoryPage({ params, searchParams }: Props) {
  const category = await resolve(params)
  if (!category || !category.department) notFound()
  const dept = DEPARTMENTS[category.department]
  const href = categoryHref(category)
  const data = await loadShop({ category: category.slug, department: category.department, activeHref: href }, await searchParams)
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
          itemListLd(categoryFullTitle(category), data.products),
        ]}
      />
      <ShopView eyebrow={`Shop / ${dept.title}${category.group ? ` / ${category.group}` : ''}`} title={categoryFullTitle(category)} description={category.description} {...data} />
    </>
  )
}
