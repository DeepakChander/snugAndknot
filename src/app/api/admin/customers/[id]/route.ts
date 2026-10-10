import { updateCustomer } from '@/server/repo/misc'
import { HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { customerPatchSchema } from '@/server/validation'

type Ctx = { params: Promise<{ id: string }> }

export const PATCH = route<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin()
  const patch = await parseBody(req, customerPatchSchema)
  const { id } = await params
  if (id === admin.id && patch.role === 'customer') {
    throw new HttpError(400, 'You cannot remove your own admin access.')
  }
  if (!(await updateCustomer(id, patch))) throw new HttpError(404, 'Customer not found.')
  return ok({ ok: true })
})
