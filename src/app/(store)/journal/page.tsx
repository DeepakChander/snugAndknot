import type { Metadata } from 'next'
import { JournalIndex } from '@/components/content/JournalViews'
import { JOURNAL } from '@/lib/journal'

export const metadata: Metadata = { title: 'Journal', description: 'Notes on knitwear: fibres, stitches and the case for fewer, better things.', alternates: { canonical: '/journal' } }

export default function JournalPage() {
  return <JournalIndex posts={JOURNAL} />
}
