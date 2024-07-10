import { db } from '@/db/connection'
import { handlerError } from '@/errors/handlerError'
import { UserCreateInput, UserUpdateInput } from '@/schemas/users'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { ulid } from 'ulid'
import { authHandlers } from '../auth/middleware'
import { subject } from '@casl/ability'

const usersRoutes = new Hono()

usersRoutes.onError(handlerError('User'))

usersRoutes.get('/', ...authHandlers(true), async (c) => {
  c.get('ability')('readList', 'User')

  const list = await db.user.findMany({
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })
  return c.json(list)
})

usersRoutes.get('/:id', ...authHandlers(true), async (c) => {
  c.get('ability')('readDetails', 'User')

  const id = c.req.param('id')
  const details = await db.user.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  })
  return c.json(details)
})

usersRoutes.post('/', zValidator('json', UserCreateInput), async (c) => {
  const { username, password } = c.req.valid('json')

  const newUser = await db.user.create({
    data: {
      id: ulid(),
      username,
      password: Bun.password.hashSync(password),
    },
  })

  c.header('newUserId', newUser.id)
  return c.json('User created successfully', 201)
})

usersRoutes.put(
  '/:id',
  ...authHandlers(),
  zValidator('json', UserUpdateInput),
  async (c) => {
    const id = c.req.param('id')

    const user = await db.user.findUniqueOrThrow({ where: { id } })
    c.get('ability')('update', subject('User', user))

    const { username, password } = c.req.valid('json')

    await db.user.update({
      where: { id },
      data: {
        username,
        password: password ? Bun.password.hashSync(password) : undefined,
      },
    })

    return c.json('User updated successfully')
  },
)

usersRoutes.delete('/:id', ...authHandlers(), async (c) => {
  const id = c.req.param('id')

  const user = await db.user.findUniqueOrThrow({ where: { id } })
  c.get('ability')('update', subject('User', user))

  await db.user.delete({ where: { id } })
  return c.json('User deleted successfully')
})

export { usersRoutes }
