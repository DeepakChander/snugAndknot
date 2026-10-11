import { deleteMessage, setMessageStatus } from '@/server/repo/misc'
import { guardWrite, HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { messagePatchSchema } from '@/server/validation'
import { messageHandled } from '@/server/notify-events'

type Ctx = { params: Promise<{ id: string }> }

export const PATCH = route<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin()
  const { status } = await parseBody(req, messagePatchSchema)
  const { id } = await params
  const result = await setMessageStatus(id, status)
  if (!result.found) throw new HttpError(404, 'Message not found.')
  // Re-marking a message with the status it already has is not news.
  if (result.changed) await messageHandled(result.changed, status, admin.email)
  return ok({ ok: true })
})

export const DELETE = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  const admin = await requireAdmin()
  const { id } = await params
  const deleted = await deleteMessage(id)
  if (!deleted) throw new HttpError(404, 'Message not found.')
  await messageHandled(deleted, 'deleted', admin.email)
  return ok({ ok: true })
})
