import { db } from '@/db/connection'
import { handlerError } from '@/errors/handlerError'
import { TagCreateInput, TagUpdateInput } from '@/schemas/tag'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { ulid } from 'ulid'
import { authHandlers } from '../auth/middleware'

const tagsRoutes = new Hono()

tagsRoutes.onError(handlerError('Tag'))

tagsRoutes.get('/', ...authHandlers(true), async (c) => {
  c.get('ability')('readList', 'Tag')
  const list = await db.tag.findMany()
  return c.json(list)
})

tagsRoutes.get('/:id', ...authHandlers(true), async (c) => {
  c.get('ability')('readDetails', 'Tag')
  const id = c.req.param('id')
  const details = await db.tag.findUniqueOrThrow({
    where: { id },
  })
  return c.json(details)
})

tagsRoutes.post(
  '/',
  ...authHandlers(),
  zValidator('json', TagCreateInput),
  async (c) => {
    c.get('ability')('create', 'Tag')
    const { name, slug } = c.req.valid('json')

    const newTag = await db.tag.create({
      data: {
        id: ulid(),
        name,
        slug,
      },
    })

    c.header('newTagId', newTag.id)
    return c.json('Tag created successfully', 201)
  },
)

tagsRoutes.put(
  '/:id',
  ...authHandlers(),
  zValidator('json', TagUpdateInput),
  async (c) => {
    c.get('ability')('update', 'Tag')
    const id = c.req.param('id')
    const { name, slug } = c.req.valid('json')

    await db.tag.update({
      where: { id },
      data: {
        name,
        slug,
      },
    })

    return c.json('Tag updated successfully')
  },
)

tagsRoutes.delete('/:id', ...authHandlers(), async (c) => {
  c.get('ability')('delete', 'Tag')
  const id = c.req.param('id')
  await db.tag.delete({ where: { id } })
  return c.json('Tag deleted successfully')
})

export { tagsRoutes }
