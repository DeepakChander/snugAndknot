import { query } from '@/server/db/client'
import { mapUser } from '@/server/auth'
import { ok, parseBody, requireUser, route } from '@/server/http'
import { profileSchema } from '@/server/validation'

export const PATCH = route(async (req) => {
  const user = await requireUser()
  const input = await parseBody(req, profileSchema)
  const rows = await query('UPDATE users SET name = $2, phone = $3 WHERE id = $1 RETURNING *', [
    user.id,
    input.name,
    input.phone || null,
  ])
  return ok({ user: mapUser(rows[0]) })
})
