import { db } from '@/db/connection'
import { env } from '@/env'
import { UserLoginInput } from '@/schemas/users'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { sign } from 'hono/jwt'
import { authHandlers } from './middleware'

const authRoutes = new Hono()

authRoutes.get('/me', ...authHandlers(), async (c) => {
  c.get('ability')('readDetails', 'User')

  const currentUser = c.get('currentUser')

  if (!currentUser) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  return c.json(currentUser)
})

authRoutes.post('/login', zValidator('json', UserLoginInput), async (c) => {
  const { username, password } = c.req.valid('json')

  const user = await db.user.findUnique({ where: { username } })

  if (!user || (user && !Bun.password.verifySync(password, user.password))) {
    throw new HTTPException(401, { message: 'Invalid Credentials' })
  }

  const token = await sign({ sub: user.id }, env.JWT_SECRET_KEY)

  return c.json({ token })
})

export { authRoutes }
