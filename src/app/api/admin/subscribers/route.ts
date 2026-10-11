import { deleteSubscriber, listSubscribers } from '@/server/repo/misc'
import { guardWrite, HttpError, ok, requireAdmin, route } from '@/server/http'
import { subscriberRemoved } from '@/server/notify-events'

export const dynamic = 'force-dynamic'

export const GET = route(async (req) => {
  await requireAdmin()
  const subscribers = await listSubscribers()
  if (new URL(req.url).searchParams.get('format') === 'csv') {
    const csv = ['email,source,subscribed_at', ...subscribers.map((s) => `${s.email},${s.source},${s.createdAt}`)].join('\n')
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="subscribers.csv"',
      },
    })
  }
  return ok({ subscribers })
})

export const DELETE = route(async (req) => {
  guardWrite(req)
  const admin = await requireAdmin()
  const email = new URL(req.url).searchParams.get('email')
  if (!email || !(await deleteSubscriber(email))) throw new HttpError(404, 'Subscriber not found.')
  await subscriberRemoved(email, admin.email)
  return ok({ ok: true })
})
