import { updateCustomer } from '@/server/repo/misc'
import { HttpError, ok, parseBody, requireAdmin, route } from '@/server/http'
import { customerPatchSchema } from '@/server/validation'
import { query } from '@/server/db/client'
import { customerPointsChanged, customerRoleChanged } from '@/server/notify-events'

type Ctx = { params: Promise<{ id: string }> }

export const PATCH = route<Ctx>(async (req, { params }) => {
  const admin = await requireAdmin()
  const patch = await parseBody(req, customerPatchSchema)
  const { id } = await params
  if (id === admin.id && patch.role === 'customer') {
    throw new HttpError(400, 'You cannot remove your own admin access.')
  }
  const [before] = await query<{ email: string; name: string; role: string; points: number }>('SELECT email, name, role, points FROM users WHERE id = $1', [id])
  const result = await updateCustomer(id, patch)
  if (result === 'not-found') throw new HttpError(404, 'Customer not found.')
  if (result === 'env-admin') throw new HttpError(400, 'This is the store owner account set by ADMIN_EMAIL. Change that variable instead.')
  if (before && patch.role && patch.role !== before.role) await customerRoleChanged(before, before.role, patch.role, admin.email)
  if (before && patch.points !== undefined && Math.max(0, Math.trunc(patch.points)) !== Number(before.points)) {
    await customerPointsChanged(before, Number(before.points), Math.max(0, Math.trunc(patch.points)), admin.email)
  }
  return ok({ ok: true })
})
