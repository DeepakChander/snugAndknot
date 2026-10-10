import { ReviewsAdmin } from '@/components/admin/PeopleAdmin'
import { listReviewsAdmin } from '@/server/repo/reviews'
import { getSettings } from '@/server/repo/settings'

export const metadata = { title: 'Reviews' }

export default async function AdminReviews() {
  const [reviews, settings] = await Promise.all([listReviewsAdmin(), getSettings()])
  return <ReviewsAdmin reviews={reviews} moderation={settings.reviews.moderation} />
}
