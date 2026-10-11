import { getReturnAdmin, updateReturnAdmin } from '@/server/repo/orders'
import { returnUpdated } from '@/server/notify-events'
import { HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { returnPatchSchema } from '@/server/validation'

type Ctx = { params: Promise<{ id: string }> }

export const PATCH = route<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin()
  const { status } = await parseBody(req, returnPatchSchema)
  const { id } = await params
  const before = await getReturnAdmin(id)
  if (!(await updateReturnAdmin(id, status))) throw new HttpError(404, 'Return not found.')
  if (before) await returnUpdated(before, status, admin.email)
  return ok({ ok: true })
})
