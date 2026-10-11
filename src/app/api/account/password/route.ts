import { query } from '@/server/db/client'
import { hashPassword, revokeSessions, sessionUser, startSession, verifyPassword } from '@/server/auth'
import { rateLimit } from '@/server/rate-limit'
import { HttpError, ok, parseBody, requireUser, route } from '@/server/http'
import { passwordChangeSchema } from '@/server/validation'

export const POST = route(async (req) => {
  const user = await requireUser()
  const input = await parseBody(req, passwordChangeSchema)
  await rateLimit('passwordChange', user.id)
  const rows = await query<{ password_hash: string; managed_by_env: boolean }>('SELECT password_hash, managed_by_env FROM users WHERE id = $1', [user.id])
  if (rows[0]?.managed_by_env) {
    throw new HttpError(400, 'This admin account’s password is set by the ADMIN_PASSWORD environment variable.')
  }
  if (!rows[0] || !(await verifyPassword(input.currentPassword, rows[0].password_hash))) {
    throw new HttpError(400, 'Your current password is incorrect.', { currentPassword: 'Incorrect password' })
  }
  if (input.newPassword === input.currentPassword) {
    throw new HttpError(422, 'Choose a password you have not used here before.', { newPassword: 'Same as the current password' })
  }
  await query('UPDATE users SET password_hash = $2 WHERE id = $1', [user.id, await hashPassword(input.newPassword)])
  // Every other device is signed out; this one gets a fresh session.
  await revokeSessions(user.id)
  const [row] = await query('SELECT * FROM users WHERE id = $1', [user.id])
  await startSession(sessionUser(row))
  return ok({ ok: true })
})
