import { deleteMedia } from '@/server/repo/misc'
import { guardWrite, HttpError, ok, requireAdmin, route } from '@/server/http'

type Ctx = { params: Promise<{ id: string }> }

export const DELETE = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  await requireAdmin()
  if (!(await deleteMedia((await params).id))) throw new HttpError(404, 'Image not found.')
  return ok({ ok: true })
})
