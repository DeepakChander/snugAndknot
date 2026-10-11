import { markHelpful } from '@/server/repo/reviews'
import { clientIp, guardWrite, HttpError, ok, route } from '@/server/http'
import { rateLimit } from '@/server/rate-limit'

type Ctx = { params: Promise<{ id: string }> }

export const POST = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  const { id } = await params
  await rateLimit('helpful', `${clientIp(req)}:${id}`)
  const helpful = await markHelpful(id)
  if (helpful === null) throw new HttpError(404, 'Review not found.')
  return ok({ helpful })
})
