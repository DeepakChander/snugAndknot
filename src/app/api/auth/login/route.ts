import { checkPassword, findUserByEmail, hashPassword, isEnvAdminEmail, isPublishedPassword, mapUser, matchEnvAdmin, needsRehash, sessionUser, startSession } from '@/server/auth'
import { query } from '@/server/db/client'
import { rateLimit } from '@/server/rate-limit'
import { clientIp, HttpError, ok, parseBody, route } from '@/server/http'
import { loginSchema } from '@/server/validation'

const FAILED = 'That email and password do not match.'

export const POST = route(async (req) => {
  const { email, password } = await parseBody(req, loginSchema)
  // Per connection, per account on that connection, and a high ceiling per account overall.
  const ip = clientIp(req)
  await rateLimit('loginIp', ip)
  await rateLimit('loginAccountIp', `${email}|${ip}`)
  await rateLimit('loginEmail', email)
  if (isPublishedPassword(password)) {
    await checkPassword(password, null)
    throw new HttpError(401, FAILED)
  }

  // The store owner's address only ever signs in with ADMIN_EMAIL / ADMIN_PASSWORD, so an old
  // password left in the database stops working the moment the variable is rotated.
  if (isEnvAdminEmail(email)) {
    const admin = await matchEnvAdmin(email, password)
    if (!admin) {
      await checkPassword(password, null)
      throw new HttpError(401, FAILED)
    }
    await startSession(admin.session)
    return ok({ user: admin.user })
  }

  const row = await findUserByEmail(email)
  // Accounts once managed by ADMIN_EMAIL keep no password login after that variable changes.
  const usable = row && row.managed_by_env !== true ? String(row.password_hash) : null
  if (!(await checkPassword(password, usable)) || !row) throw new HttpError(401, FAILED)

  if (needsRehash(String(row.password_hash))) {
    await query('UPDATE users SET password_hash = $2 WHERE id = $1', [row.id, await hashPassword(password)])
  }
  await startSession(sessionUser(row))
  return ok({ user: mapUser(row) })
})
