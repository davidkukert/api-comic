import { db } from '@/db/connection'
import { handlerError } from '@/errors/handlerError'
import { ProjectCreateInput, ProjectUpdateInput } from '@/schemas/project'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { ulid } from 'ulid'

const projectsRoutes = new Hono()

projectsRoutes.onError(handlerError('Project'))

projectsRoutes.get('/', async (c) => {
  const list = await db.project.findMany({
    include: {
      tags: true,
    },
  })

  return c.json(list)
})

projectsRoutes.get('/:id', async (c) => {
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

projectsRoutes.post('/', zValidator('json', ProjectCreateInput), async (c) => {
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
})

projectsRoutes.put(
  '/:id',
  zValidator('json', ProjectUpdateInput),
  async (c) => {
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

projectsRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id')
  await db.project.delete({ where: { id } })

  return c.json('Project deleted successfully')
})

export { projectsRoutes }
