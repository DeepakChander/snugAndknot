import type { ReviewSource } from '@/types/commerce'

/** How a review's origin reads next to the customer's name: "via WhatsApp". */
export const SOURCE_LABEL: Record<ReviewSource, string> = {
  site: 'on the site',
  whatsapp: 'via WhatsApp',
  instagram: 'via Instagram',
  marketplace: 'via a marketplace',
  email: 'by email',
  'in-person': 'in person',
}
