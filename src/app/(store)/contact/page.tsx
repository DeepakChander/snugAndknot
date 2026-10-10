import type { Metadata } from 'next'
import ContactView from '@/components/content/ContactView'

export const metadata: Metadata = { title: 'Contact', description: 'Write to the Snug&Knot atelier.' }

export default function ContactPage() {
  return <ContactView />
}
