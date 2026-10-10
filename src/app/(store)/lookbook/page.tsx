import type { Metadata } from 'next'
import LookbookView, { type Spread } from '@/components/content/LookbookView'
import lookbook from '@/data/lookbook.json'

export const metadata: Metadata = { title: 'Lookbook', description: 'Five stories in Snug&Knot knitwear — quiet luxury, golden hour, after dark, new workwear and soft focus.' }

export default function LookbookPage() {
  const spreads: Spread[] = (lookbook as Spread[]).map(({ id, title, subtitle, description, season, images }) => ({ id, title, subtitle, description, season, images: images.map(({ src, alt }) => ({ src, alt })) }))
  return <LookbookView spreads={spreads} />
}
