import { findUserByEmail, mapUser, matchEnvAdmin, startSession, throttle, verifyPassword } from '@/server/auth'
import { clientIp, HttpError, ok, parseBody, route } from '@/server/http'
import { loginSchema } from '@/server/validation'

export const POST = route(async (req) => {
  const { email, password } = await parseBody(req, loginSchema)
  if (!throttle(`login:${clientIp(req)}:${email}`, 10)) {
    throw new HttpError(429, 'Too many sign-in attempts. Please wait 15 minutes and try again.')
  }

  const envAdmin = await matchEnvAdmin(email, password)
  if (envAdmin) {
    await startSession(envAdmin)
    return ok({ user: envAdmin })
  }

  const row = await findUserByEmail(email)
  if (!row || !(await verifyPassword(password, String(row.password_hash)))) {
    throw new HttpError(401, 'That email and password do not match.')
  }
  const user = mapUser(row)
  await startSession(user)
  return ok({ user })
})
