import type { Metadata } from 'next'
import NotFoundView from '@/components/content/NotFoundView'

export const metadata: Metadata = { title: 'Page not found' }

export default function NotFound() {
  return <NotFoundView standalone />
}
