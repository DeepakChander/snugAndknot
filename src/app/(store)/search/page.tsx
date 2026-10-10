import type { Metadata } from 'next'
import SearchView from '@/components/shop/SearchView'
import { getProducts } from '@/server/catalog'

export const metadata: Metadata = { title: 'Search', robots: { index: false } }

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const raw = (await searchParams).q
  const query = (Array.isArray(raw) ? raw[0] : raw ?? '').trim().slice(0, 80)
  const [results, popular] = await Promise.all([query ? getProducts({ search: query }) : Promise.resolve([]), getProducts({ sort: 'featured', limit: 4 })])
  return <SearchView key={query} query={query} results={results} popular={popular} />
}
