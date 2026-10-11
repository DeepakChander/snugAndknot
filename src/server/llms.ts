import 'server-only'
import { getCategories, getCollections, getProducts, getStoreSettings } from '@/server/catalog'
import { DEPARTMENTS } from '@/server/shop'
import { faqGroups } from '@/lib/faq'
import { formatMoney } from '@/lib/format'
import { JOURNAL } from '@/lib/journal'
import { plain } from '@/lib/accent'
import { absoluteUrl } from '@/lib/site'
import type { Product } from '@/types/commerce'

/**
 * llms.txt (https://llmstxt.org): a plain Markdown map of the shop for AI assistants and answer
 * engines. The short file links every page that matters; the full file adds the product details,
 * policies, FAQ and journal text. Built only from the live catalogue and settings, so it never
 * says anything the site itself does not.
 */
export async function buildLlmsTxt({ full }: { full: boolean }): Promise<string> {
  const [settings, products, categories, collections] = await Promise.all([
    getStoreSettings(),
    getProducts({ sort: 'featured' }),
    getCategories(),
    getCollections(),
  ])
  const { store, commerce, homepage } = settings
  const money = (n: number) => formatMoney(n, commerce.currency, commerce.locale)
  const link = (title: string, path: string, note?: string) => `- [${title}](${absoluteUrl(path)})${note ? `: ${note}` : ''}`
  const oneLine = (s: string) => plain(s).replace(/\s+/g, ' ').trim()

  const priceOf = (p: Product) => (p.compareAtPrice && p.compareAtPrice > p.price ? `${money(p.price)} (was ${money(p.compareAtPrice)})` : money(p.price))
  const productLine = (p: Product) => {
    const bits = [p.productType, p.details.fabric, priceOf(p)]
    if (p.reviewCount > 0) bits.push(`rated ${p.rating.toFixed(1)}/5 from ${p.reviewCount} review${p.reviewCount === 1 ? '' : 's'}`)
    return link(p.title, `/product/${p.handle}`, bits.filter(Boolean).join(' · '))
  }

  const departments = (['women', 'men', 'kids'] as const).flatMap((d) => {
    const n = products.filter((p) => p.gender === d || (d !== 'kids' && p.gender === 'unisex')).length
    return n ? [link(DEPARTMENTS[d].title, `/shop/${d}`, `${n} piece${n === 1 ? '' : 's'}. ${DEPARTMENTS[d].description}`)] : []
  })

  const facts = [
    `Prices are in ${commerce.currency}.`,
    commerce.freeShippingThreshold > 0 ? `Standard shipping is ${money(commerce.standardShippingRate)}, free on orders over ${money(commerce.freeShippingThreshold)}; express is ${money(commerce.expressShippingRate)}.` : `Standard shipping is ${money(commerce.standardShippingRate)}; express is ${money(commerce.expressShippingRate)}.`,
    `Unworn pieces in their original condition can be returned within ${commerce.returnWindowDays} days of delivery.`,
    commerce.codEnabled ? 'Orders are paid on delivery (cash on delivery).' : '',
  ].filter(Boolean)

  const out: string[] = [
    `# ${store.name}`,
    '',
    `> ${oneLine(store.description)}`,
    '',
    `${store.name} is an online knitwear shop. ${oneLine(homepage.manifesto)}`,
    '',
    facts.join(' '),
    '',
    `Contact: ${store.email}${store.phone ? `, ${store.phone}` : ''}.`,
    '',
    '## Shop',
    '',
    link('All pieces', '/shop', `the full catalogue, ${products.length} piece${products.length === 1 ? '' : 's'}`),
    ...departments,
    ...categories.map((c) => link(c.title, `/shop/${c.slug}`, oneLine(c.description) || undefined)),
    '',
    '## Pieces',
    '',
    ...products.map(productLine),
    '',
    '## Collections',
    '',
    ...collections.map((c) => link(c.title, `/collections/${c.handle}`, oneLine(c.description) || undefined)),
    '',
    '## Customer care',
    '',
    link('Shipping & returns', '/shipping-returns', 'rates, delivery and how to return a piece'),
    link('Questions & answers', '/faq', 'ordering, delivery, sizing, returns and accounts'),
    link('Size guide', '/size-guide', 'body measurements for every size'),
    link('Caring for knitwear', '/care-instructions', 'washing, drying and storing each fibre'),
    link('Track an order', '/track', 'with the order number and email'),
    link('Contact', '/contact'),
    '',
    '## Journal',
    '',
    ...JOURNAL.map((j) => link(j.title, `/journal/${j.slug}`, j.description)),
    '',
    '## About',
    '',
    link('Our story', '/about', 'how and why the pieces are made'),
    link('Lookbook', '/lookbook', 'knitwear photographed in four chapters, each listing the pieces from the shop'),
    '',
    '## Optional',
    '',
    full ? link('Short version of this file', '/llms.txt') : link('Full version of this file', '/llms-full.txt', 'product details, policies, FAQ and journal articles in one document'),
    link('Privacy policy', '/privacy-policy'),
    link('Terms of service', '/terms-of-service'),
    link('Sitemap', '/sitemap.xml'),
  ]

  if (full) {
    out.push('', '---', '', '# Product details', '')
    for (const p of products) {
      const sizes = [...new Set(p.variants.map((v) => v.size).filter(Boolean))]
      const inStock = p.variants.length === 0 || p.variants.some((v) => v.available)
      out.push(
        `## ${p.title}`,
        '',
        `URL: ${absoluteUrl(`/product/${p.handle}`)}`,
        `Type: ${p.productType}. Price: ${priceOf(p)}. ${inStock ? 'In stock' : 'Sold out'}.`,
        ...(p.colors.length ? [`Colours: ${p.colors.map((c) => c.name).join(', ')}.`] : []),
        ...(sizes.length ? [`Sizes: ${sizes.join(', ')}.`] : []),
        ...(p.details.fabric ? [`Fabric: ${p.details.fabric}.`] : []),
        ...(p.details.fit ? [`Fit: ${p.details.fit}.`] : []),
        ...(p.details.care ? [`Care: ${p.details.care}`] : []),
        ...(p.details.features?.length ? [`Details: ${p.details.features.join('; ')}.`] : []),
        ...(p.reviewCount > 0 ? [`Reviews: ${p.rating.toFixed(1)}/5 from ${p.reviewCount}.`] : []),
        '',
        oneLine(p.description),
        ''
      )
    }
    out.push('# Questions & answers', '')
    for (const g of faqGroups(settings)) {
      out.push(`## ${g.name}`, '')
      for (const it of g.items) out.push(`**${it.q}**`, '', it.a, '')
    }
    out.push('# Journal', '')
    for (const j of JOURNAL) {
      out.push(`## ${j.title}`, '', `URL: ${absoluteUrl(`/journal/${j.slug}`)} · ${j.date}`, '')
      for (const b of j.body) out.push(b.type === 'h' ? `### ${b.text}` : b.type === 'quote' ? `> ${b.text}` : b.text, '')
    }
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
}
