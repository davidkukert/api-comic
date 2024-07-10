import { db } from '@/db/connection'
import { handlerError } from '@/errors/handlerError'
import { ChapterCreateInput, ChapterUpdateInput } from '@/schemas/chapter'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ulid } from 'ulid'
import { authHandlers } from '../auth/middleware'

const chaptersRoutes = new Hono()

chaptersRoutes.onError(handlerError('Chapter'))

chaptersRoutes.get('/', ...authHandlers(true), async (c) => {
  c.get('ability')('readList', 'Chapter')
  const list = await db.chapter.findMany({
    include: { project: true },
  })
  return c.json(list)
})

chaptersRoutes.get('/:id', ...authHandlers(true), async (c) => {
  c.get('ability')('readDetails', 'Chapter')
  const id = c.req.param('id')
  const details = await db.chapter.findUniqueOrThrow({
    where: { id },
    include: { project: true },
  })
  return c.json(details)
})

chaptersRoutes.post(
  '/',
  ...authHandlers(),
  zValidator('json', ChapterCreateInput),
  async (c) => {
    c.get('ability')('create', 'Chapter')
    const { number, pages, projectId, title } = c.req.valid('json')

    const project = await db.project.findUnique({ where: { id: projectId } })

    if (!project) {
      throw new HTTPException(404, {
        message: 'No projects were found with this projectId',
      })
    }

    const newChapter = await db.chapter.create({
      data: {
        id: ulid(),
        number,
        pages,
        title,
        project: {
          connect: {
            id: project.id,
          },
        },
      },
    })

    c.header('newChapterId', newChapter.id)
    return c.json('Chapter created successfully', 201)
  },
)

chaptersRoutes.put(
  '/:id',
  ...authHandlers(),
  zValidator('json', ChapterUpdateInput),
  async (c) => {
    c.get('ability')('update', 'Chapter')
    const id = c.req.param('id')
    const { number, pages, projectId, title } = c.req.valid('json')

    if (projectId) {
      const project = await db.project.findUnique({
        where: { id: projectId },
      })

      if (!project) {
        throw new HTTPException(404, {
          message: 'No projects were found with this projectId',
        })
      }
    }

    await db.chapter.update({
      where: { id },
      data: {
        number,
        pages,
        title,
        project: projectId
          ? {
              connect: {
                id: projectId,
              },
            }
          : undefined,
      },
    })

    return c.json('Chapter updated successfully')
  },
)

chaptersRoutes.delete('/:id', ...authHandlers(), async (c) => {
  c.get('ability')('delete', 'Chapter')
  const id = c.req.param('id')
  await db.chapter.delete({ where: { id } })
  return c.json('Chapter deleted successfully')
})

export { chaptersRoutes }
