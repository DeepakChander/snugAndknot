import { getStoreSettings } from '@/server/catalog'
import { JOURNAL } from '@/lib/journal'
import { absoluteUrl } from '@/lib/site'

export const revalidate = 3600

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

/** RSS 2.0 feed of the journal, newest first. */
export async function GET() {
  const { store } = await getStoreSettings()
  const posts = [...JOURNAL].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  const items = posts
    .map((p) => {
      const url = absoluteUrl(`/journal/${p.slug}`)
      return `    <item>
      <title>${xml(p.title)}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="true">${xml(url)}</guid>
      <description>${xml(p.description)}</description>
      <category>${xml(p.tag)}</category>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    </item>`
    })
    .join('\n')
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(`${store.name} Journal`)}</title>
    <link>${xml(absoluteUrl('/journal'))}</link>
    <atom:link href="${xml(absoluteUrl('/journal/feed.xml'))}" rel="self" type="application/rss+xml" />
    <description>${xml('Notes on knitwear: fibres, stitches and the case for fewer, better things.')}</description>
    <language>en</language>
${posts[0] ? `    <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>\n` : ''}${items}
  </channel>
</rss>
`
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
