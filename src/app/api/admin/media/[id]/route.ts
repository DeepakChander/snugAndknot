import { deleteMedia } from '@/server/repo/misc'
import { guardWrite, HttpError, ok, requireAdmin, route } from '@/server/http'
import { catalogChanged } from '@/server/notify-events'

type Ctx = { params: Promise<{ id: string }> }

export const DELETE = route<Ctx>(async (req, { params }) => {
  guardWrite(req)
  const admin = await requireAdmin()
  const { id } = await params
  const filename = await deleteMedia(id)
  if (filename === null) throw new HttpError(404, 'Image not found.')
  await catalogChanged('Image', 'deleted', filename || id, admin.email, [['URL', `/api/media/${id}`]])
  return ok({ ok: true })
})
