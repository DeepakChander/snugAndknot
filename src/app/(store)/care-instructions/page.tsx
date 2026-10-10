import type { Metadata } from 'next'
import { CareView } from '@/components/content/ServiceViews'

export const metadata: Metadata = { title: 'Caring for knitwear', description: 'How to wash, dry and store merino, cashmere blends and cotton–silk knits.' }

export default function CarePage() {
  return <CareView />
}
