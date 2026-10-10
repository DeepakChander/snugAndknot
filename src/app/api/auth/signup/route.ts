import { createUser, findUserByEmail, startSession, throttle } from '@/server/auth'
import { clientIp, HttpError, ok, parseBody, route } from '@/server/http'
import { signupSchema } from '@/server/validation'

export const POST = route(async (req) => {
  const input = await parseBody(req, signupSchema)
  if (!throttle(`signup:${clientIp(req)}`, 10)) throw new HttpError(429, 'Too many attempts. Please wait a few minutes.')
  if (await findUserByEmail(input.email)) {
    throw new HttpError(409, 'An account with this email already exists. Try signing in.', { email: 'Already registered' })
  }
  // Welcome bonus: 100 loyalty points.
  const user = await createUser({ ...input, points: 100 })
  await startSession(user)
  return ok({ user }, { status: 201 })
})
