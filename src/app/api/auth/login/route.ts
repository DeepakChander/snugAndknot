import { checkPassword, findUserByEmail, hashPassword, isEnvAdminEmail, isPublishedPassword, mapUser, matchEnvAdmin, needsRehash, sessionUser, startSession } from '@/server/auth'
import { query } from '@/server/db/client'
import { rateLimit } from '@/server/rate-limit'
import { clientIp, HttpError, ok, parseBody, route } from '@/server/http'
import { loginSchema } from '@/server/validation'
import { adminLoginFailed, adminSignedIn, customerLoginFailed, customerSignedIn } from '@/server/notify-events'

const FAILED = 'That email and password do not match.'

export const POST = route(async (req) => {
  const { email, password } = await parseBody(req, loginSchema)
  // Per connection, per account on that connection, and a high ceiling per account overall.
  const ip = clientIp(req)
  const ua = req.headers.get('user-agent')
  await rateLimit('loginIp', ip)
  await rateLimit('loginAccountIp', `${email}|${ip}`)
  await rateLimit('loginEmail', email)

  // The response is the same whichever way a sign-in fails; only the store inbox hears which it was.
  const failed = async (row: Record<string, unknown> | null | undefined) => {
    if (isEnvAdminEmail(email)) await adminLoginFailed(email, ip, ua, true)
    else if (row?.role === 'admin') await adminLoginFailed(email, ip, ua, false)
    else await customerLoginFailed(email, ip, ua, !!row)
    return new HttpError(401, FAILED)
  }

  if (isPublishedPassword(password)) {
    await checkPassword(password, null)
    throw await failed(isEnvAdminEmail(email) ? null : await findUserByEmail(email))
  }

  // The store owner's address only ever signs in with ADMIN_EMAIL / ADMIN_PASSWORD, so an old
  // password left in the database stops working the moment the variable is rotated.
  if (isEnvAdminEmail(email)) {
    const admin = await matchEnvAdmin(email, password)
    if (!admin) {
      await checkPassword(password, null)
      throw await failed(null)
    }
    await startSession(admin.session)
    await adminSignedIn(email, ip, ua, true)
    return ok({ user: admin.user })
  }

  const row = await findUserByEmail(email)
  // Accounts once managed by ADMIN_EMAIL keep no password login after that variable changes.
  const usable = row && row.managed_by_env !== true ? String(row.password_hash) : null
  if (!(await checkPassword(password, usable)) || !row) throw await failed(row)

  if (needsRehash(String(row.password_hash))) {
    await query('UPDATE users SET password_hash = $2 WHERE id = $1', [row.id, await hashPassword(password)])
  }
  await startSession(sessionUser(row))
  if (row.role === 'admin') await adminSignedIn(String(row.email), ip, ua, false)
  else await customerSignedIn({ id: String(row.id), email: String(row.email), name: String(row.name) }, ip, ua)
  return ok({ user: mapUser(row) })
})
