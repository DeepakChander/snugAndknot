import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { JournalArticle } from '@/components/content/JournalViews'
import { getJournalPost, JOURNAL } from '@/lib/journal'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return JOURNAL.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getJournalPost((await params).slug)
  return post ? { title: post.title, description: post.description, openGraph: { images: [{ url: post.image }] } } : { title: 'Story not found' }
}

export default async function JournalPostPage({ params }: Props) {
  const post = getJournalPost((await params).slug)
  if (!post) notFound()
  return <JournalArticle post={post} more={JOURNAL.filter((p) => p.slug !== post.slug).slice(0, 2)} />
}
