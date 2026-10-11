import { deleteMessage, setMessageStatus } from '@/server/repo/misc'
import { guardWrite, HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { messagePatchSchema } from '@/server/validation'

type Ctx = { params: Promise<{ id: string }> }

export const PATCH = route<Ctx>(async (req, { params }) => {
  await requireAdmin()
  const { status } = await parseBody(req, messagePatchSchema)
  if (!(await setMessageStatus((await params).id, status))) throw new HttpError(404, 'Message not found.')
  return ok({ ok: true })
})

export const DELETE = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  await requireAdmin()
  if (!(await deleteMessage((await params).id))) throw new HttpError(404, 'Message not found.')
  return ok({ ok: true })
})
