import { updateReturnAdmin } from '@/server/repo/orders'
import { HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { returnPatchSchema } from '@/server/validation'

type Ctx = { params: Promise<{ id: string }> }

export const PATCH = route<Ctx>(async (req, { params }) => {
  await requireAdmin()
  const { status } = await parseBody(req, returnPatchSchema)
  if (!(await updateReturnAdmin((await params).id, status))) throw new HttpError(404, 'Return not found.')
  return ok({ ok: true })
})
