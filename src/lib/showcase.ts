/**
 * Sample reviews for the private client showcase (Admin → Settings → Home page → Client showcase):
 * a design preview of the home page's reviews section before the shop has real ones. They are
 * never stored as reviews, never count towards a rating, and only appear through the secret
 * showcase link, every card tagged Sample.
 */
export interface SampleReview {
  id: string
  author: string
  rating: number
  title: string
  body: string
  /** Shown this many days before today. */
  daysAgo: number
  productHandle: string
  productTitle: string
}

export const SAMPLE_REVIEWS: SampleReview[] = [
  { id: 'sample-1', author: 'Ananya R.', rating: 5, title: 'Softer than I expected', body: 'The cable knit is beautiful in person and it is really soft against the skin. I wear it over a plain tee to work almost every week.', daysAgo: 4, productHandle: 'ivory-cable-knit-cardigan', productTitle: 'Ivory Cable Knit Cardigan' },
  { id: 'sample-2', author: 'Rohan M.', rating: 5, title: 'Great fit', body: 'Fits true to size and the red trim looks sharp. The fabric has a nice weight to it, not thin like most tees.', daysAgo: 6, productHandle: 'black-red-contrast-knit-tee', productTitle: 'Noir & Crimson Contrast Knit Tee' },
  { id: 'sample-3', author: 'Arjun P.', rating: 5, title: 'My new favourite tee', body: 'Comfortable all day and the colour blocking gets compliments. Delivery took four days and it came well packed.', daysAgo: 12, productHandle: 'navy-tan-colorblock-knit-tee', productTitle: 'Dusk & Sand Colorblock Knit Tee' },
  { id: 'sample-4', author: 'Sneha K.', rating: 4, title: 'Lovely colour', body: 'The terracotta shade is even nicer than the photos. Slightly roomy on the shoulders, so size down if you like a closer fit.', daysAgo: 9, productHandle: 'terracotta-textured-cardigan', productTitle: 'Terracotta Textured Cardigan' },
  { id: 'sample-5', author: 'Pooja D.', rating: 5, title: 'Perfect for evenings', body: 'Light enough for evenings out and warm enough for the office AC. The texture looks premium.', daysAgo: 21, productHandle: 'terracotta-textured-cardigan', productTitle: 'Terracotta Textured Cardigan' },
  { id: 'sample-6', author: 'Vikram N.', rating: 4, title: 'Ordered a second one', body: 'Liked the first one so much I ordered another for my brother. Easy return process for a size swap too.', daysAgo: 26, productHandle: 'navy-tan-colorblock-knit-tee', productTitle: 'Dusk & Sand Colorblock Knit Tee' },
]
