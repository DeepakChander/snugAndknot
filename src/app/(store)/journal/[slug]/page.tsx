import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JournalArticle } from '@/components/content/JournalViews'
import { getJournalPost, JOURNAL } from '@/lib/journal'
import { getStoreSettings } from '@/server/catalog'
import JsonLd from '@/components/seo/JsonLd'
import { articleLd, breadcrumbLd, metaDescription } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return JOURNAL.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getJournalPost((await params).slug)
  if (!post) return { title: 'Story not found' }
  const { store } = await getStoreSettings()
  const path = `/journal/${post.slug}`
  const description = metaDescription(post.description)
  const images = [{ url: post.image, alt: post.title }]
  return {
    title: post.title,
    description,
    alternates: { canonical: path, types: { 'application/rss+xml': [{ url: '/journal/feed.xml', title: `${store.name} Journal` }] } },
    openGraph: { type: 'article', siteName: store.name, locale: 'en_US', url: path, title: post.title, description, images, publishedTime: post.date, section: post.tag },
    twitter: { card: 'summary_large_image', title: post.title, description, images },
  }
}

export default async function JournalPostPage({ params }: Props) {
  const post = getJournalPost((await params).slug)
  if (!post) notFound()
  const settings = await getStoreSettings()
  return (
    <>
      <JsonLd
        data={[
          articleLd(post, settings),
          breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Journal', path: '/journal' }, { name: post.title, path: `/journal/${post.slug}` }]),
        ]}
      />
      <JournalArticle post={post} more={JOURNAL.filter((p) => p.slug !== post.slug).slice(0, 2)} />
    </>
  )
}
