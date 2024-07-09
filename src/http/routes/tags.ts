import { db } from '@/db/connection'
import { handlerError } from '@/errors/handlerError'
import { TagCreateInput, TagUpdateInput } from '@/schemas/tag'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { ulid } from 'ulid'

const tagsRoutes = new Hono()

tagsRoutes.onError(handlerError('Tag'))

tagsRoutes.get('/', async (c) => {
  const list = await db.tag.findMany()
  return c.json(list)
})

tagsRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  const details = await db.tag.findUniqueOrThrow({
    where: { id },
  })
  return c.json(details)
})

tagsRoutes.post('/', zValidator('json', TagCreateInput), async (c) => {
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
})

tagsRoutes.put('/:id', zValidator('json', TagUpdateInput), async (c) => {
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
})

tagsRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')
  await db.tag.delete({ where: { id } })
  return c.json('Tag deleted successfully')
})

export { tagsRoutes }
