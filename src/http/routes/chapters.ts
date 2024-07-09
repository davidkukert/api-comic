import { db } from '@/db/connection'
import { handlerError } from '@/errors/handlerError'
import { ChapterCreateInput, ChapterUpdateInput } from '@/schemas/chapter'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ulid } from 'ulid'

const chaptersRoutes = new Hono()

chaptersRoutes.onError(handlerError('Chapter'))

chaptersRoutes.get('/', async (c) => {
  const list = await db.chapter.findMany({
    include: { project: true },
  })
  return c.json(list)
})

chaptersRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  const details = await db.chapter.findUniqueOrThrow({
    where: { id },
    include: { project: true },
  })
  return c.json(details)
})

chaptersRoutes.post('/', zValidator('json', ChapterCreateInput), async (c) => {
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
})

chaptersRoutes.put(
  '/:id',
  zValidator('json', ChapterUpdateInput),
  async (c) => {
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

chaptersRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')
  await db.chapter.delete({ where: { id } })
  return c.json('Chapter deleted successfully')
})

export { chaptersRoutes }
