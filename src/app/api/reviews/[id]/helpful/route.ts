import { markHelpful } from '@/server/repo/reviews'
import { clientIp, guardWrite, HttpError, ok, route } from '@/server/http'
import { throttle } from '@/server/auth'

type Ctx = { params: Promise<{ id: string }> }

export const POST = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  const { id } = await params
  if (!throttle(`helpful:${clientIp(req)}:${id}`, 1, 24 * 3600_000)) {
    throw new HttpError(429, 'You have already marked this review as helpful.')
  }
  const helpful = await markHelpful(id)
  if (helpful === null) throw new HttpError(404, 'Review not found.')
  return ok({ helpful })
})
