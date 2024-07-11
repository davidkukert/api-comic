import { db } from '@/db/connection'
import { handlerError } from '@/errors/handlerError'
import {
  ProjectCreateInput,
  ProjectManageTagsInput,
  ProjectManageTagsQuery,
  ProjectUpdateInput,
} from '@/schemas/project'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { ulid } from 'ulid'
import { authHandlers } from '../auth/middleware'
import { HTTPException } from 'hono/http-exception'

const projectsRoutes = new Hono()

projectsRoutes.onError(handlerError('Project'))

projectsRoutes.get('/', ...authHandlers(true), async (c) => {
  c.get('ability')('readList', 'Project')
  const list = await db.project.findMany({
    include: {
      tags: true,
    },
  })

  return c.json(list)
})

projectsRoutes.get('/:id', ...authHandlers(true), async (c) => {
  c.get('ability')('readDetails', 'Project')
  const id = c.req.param('id')
  const details = await db.project.findUniqueOrThrow({
    where: { id },
    include: {
      tags: true,
      chapters: true,
    },
  })

  return c.json(details)
})

projectsRoutes.post(
  '/',
  ...authHandlers(),
  zValidator('json', ProjectCreateInput),
  async (c) => {
    c.get('ability')('create', 'Project')
    const {
      adult,
      authors,
      cover,
      description,
      mediaType,
      slug,
      title,
      titlesAlternatives,
    } = c.req.valid('json')

    const newProject = await db.project.create({
      data: {
        id: ulid(),
        adult,
        authors,
        cover,
        description,
        mediaType,
        slug,
        title,
        titlesAlternatives,
      },
    })

    c.header('newProjectId', newProject.id)
    return c.json('Project created successfully', 201)
  },
)

projectsRoutes.put(
  '/:id',
  ...authHandlers(),
  zValidator('json', ProjectUpdateInput),
  async (c) => {
    c.get('ability')('update', 'Project')
    const id = c.req.param('id')
    const {
      adult,
      authors,
      cover,
      description,
      mediaType,
      slug,
      title,
      titlesAlternatives,
    } = c.req.valid('json')

    await db.project.update({
      where: { id },
      data: {
        adult,
        authors,
        cover,
        description,
        mediaType,
        slug,
        title,
        titlesAlternatives,
      },
    })

    return c.json('Project updated successfully')
  },
)

projectsRoutes.delete('/:id', ...authHandlers(), async (c) => {
  c.get('ability')('delete', 'Project')
  const id = c.req.param('id')
  await db.project.delete({ where: { id } })

  return c.json('Project deleted successfully')
})

projectsRoutes.put(
  '/:id/tags',
  ...authHandlers(),
  zValidator('json', ProjectManageTagsInput),
  zValidator('query', ProjectManageTagsQuery),
  async (c) => {
    c.get('ability')('update', 'Project')
    const id = c.req.param('id')
    const project = await db.project.findUniqueOrThrow({ where: { id } })
    const { tags } = c.req.valid('json')
    const { action } = c.req.valid('query')
    const tagsList = []
    for (const tag of tags) {
      const tagExists = await db.tag.findUnique({ where: { id: tag } })
      if (tagExists) {
        tagsList.push({ id: tagExists.id })
      }
    }

    if (tagsList.length === 0) {
      throw new HTTPException(400, { message: 'Tags Ids invalids' })
    }

    if (action === 'add') {
      await db.project.update({
        where: { id: project.id },
        data: {
          tags: {
            connect: tagsList,
          },
        },
      })
    } else if (action === 'remove') {
      await db.project.update({
        where: { id: project.id },
        data: {
          tags: {
            disconnect: tagsList,
          },
        },
      })
    }

    return c.json(`Tags ${action} to project successfully`)
  },
)

export { projectsRoutes }
