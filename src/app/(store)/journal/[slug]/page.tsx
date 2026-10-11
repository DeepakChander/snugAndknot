import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JournalArticle } from '@/components/content/JournalViews'
import { getJournalPost, JOURNAL } from '@/lib/journal'
import { getStoreSettings } from '@/server/catalog'
import JsonLd from '@/components/seo/JsonLd'
import { articleLd, breadcrumbLd, pageMeta, socialImage } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

// Only the posts that exist: any other slug is a real 404, not a page rendered on demand.
export const dynamicParams = false

export function generateStaticParams() {
  return JOURNAL.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getJournalPost((await params).slug)
  if (!post) return { title: 'Story not found' }
  const settings = await getStoreSettings()
  const meta = pageMeta(settings, {
    title: post.title,
    description: post.description,
    path: `/journal/${post.slug}`,
    images: [socialImage(post.image, post.imageAlt)],
    article: { publishedTime: `${post.date}T09:00:00+00:00`, section: post.tag },
  })
  return { ...meta, alternates: { ...meta.alternates, types: { 'application/rss+xml': [{ url: '/journal/feed.xml', title: `${settings.store.name} Journal` }] } } }
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
