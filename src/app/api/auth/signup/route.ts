import { createUser, findUserByEmail, isEnvAdminEmail, mapUser, sessionUser, startSession } from '@/server/auth'
import { rateLimit } from '@/server/rate-limit'
import { clientIp, HttpError, ok, parseBody, route } from '@/server/http'
import { signupSchema } from '@/server/validation'
import { customerSignedUp } from '@/server/notify-events'

export const POST = route(async (req) => {
  const input = await parseBody(req, signupSchema)
  await rateLimit('signup', clientIp(req))
  // The store owner's admin address cannot be registered as a customer account.
  if (isEnvAdminEmail(input.email) || (await findUserByEmail(input.email))) {
    throw new HttpError(409, 'An account with this email already exists. Try signing in.', { email: 'Already registered' })
  }
  // Welcome bonus: 100 loyalty points.
  const row = await createUser({ ...input, points: 100 })
  await startSession(sessionUser(row))
  await customerSignedUp(mapUser(row))
  return ok({ user: mapUser(row) }, { status: 201 })
})
