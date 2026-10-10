import { query } from '@/server/db/client'
import { hashPassword, throttle, verifyPassword } from '@/server/auth'
import { HttpError, ok, parseBody, requireUser, route } from '@/server/http'
import { passwordChangeSchema } from '@/server/validation'

export const POST = route(async (req) => {
  const user = await requireUser()
  const input = await parseBody(req, passwordChangeSchema)
  if (!throttle(`pw:${user.id}`, 8)) throw new HttpError(429, 'Too many attempts. Please wait a few minutes.')
  const rows = await query<{ password_hash: string }>('SELECT password_hash FROM users WHERE id = $1', [user.id])
  if (!rows[0] || !(await verifyPassword(input.currentPassword, rows[0].password_hash))) {
    throw new HttpError(400, 'Your current password is incorrect.', { currentPassword: 'Incorrect password' })
  }
  await query('UPDATE users SET password_hash = $2 WHERE id = $1', [user.id, await hashPassword(input.newPassword)])
  return ok({ ok: true })
})
