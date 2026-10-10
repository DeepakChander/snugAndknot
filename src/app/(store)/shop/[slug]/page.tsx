import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ShopView from '@/components/shop/ShopView'
import { DEPARTMENTS, loadShop } from '@/server/shop'
import { getCategory } from '@/server/catalog'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function isDepartment(slug: string): slug is keyof typeof DEPARTMENTS {
  return slug in DEPARTMENTS
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (isDepartment(slug)) return { title: `${DEPARTMENTS[slug].title}'s knitwear`, description: DEPARTMENTS[slug].description }
  const category = await getCategory(slug)
  return category ? { title: category.title, description: category.description } : { title: 'Not found' }
}

export default async function ShopSegmentPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  if (isDepartment(slug)) {
    const dept = DEPARTMENTS[slug]
    const data = await loadShop({ gender: slug, activeHref: `/shop/${slug}` }, sp)
    return (
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
    )
  }

  const category = await getCategory(slug)
  if (!category) notFound()
  const data = await loadShop({ category: slug, activeHref: `/shop/${slug}` }, sp)
  return <ShopView eyebrow={`Shop / ${category.title}`} title={category.title} description={category.description} {...data} />
}
