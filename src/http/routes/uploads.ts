import { db } from '@/db/connection'
import { deleteObject, getObject, putObject } from '@/libs/cloudflare/r2'
import { CoverUploadInput, PagesUploadInput } from '@/schemas/uploads'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import * as path from 'path'
import { authHandlers } from '../auth/middleware'

const uploadsRoutes = new Hono()

uploadsRoutes.post(
  '/projects/:id/cover',
  ...authHandlers(),
  zValidator('form', CoverUploadInput),
  async (c) => {
    c.get('ability')('create', 'Project')
    const id = c.req.param('id')
    const project = await db.project.findUnique({ where: { id } })
    if (!project) {
      throw new HTTPException(404, { message: 'Project not found' })
    }

    const { cover } = c.req.valid('form')
    const coverArrayBuffer = await cover.arrayBuffer()
    const coverUint8Array = new Uint8Array(coverArrayBuffer)
    const key = `projects/${id}/cover${path.extname(cover.name)}`

    try {
      await putObject(key, coverUint8Array, cover.type)

      await db.project.update({
        data: { cover: key },
        where: { id },
      })

      return c.json('Cover uploaded', 201)
    } catch (error) {
      throw new HTTPException(500, { message: 'Failed to upload cover' })
    }
  },
)

uploadsRoutes.get('/projects/:id/cover', ...authHandlers(true), async (c) => {
  c.get('ability')('readDetails', 'Project')
  const id = c.req.param('id')
  const project = await db.project.findUnique({ where: { id } })
  if (!project) {
    throw new HTTPException(404, { message: 'Project not found' })
  }

  return getObject(project.cover)
    .then(async (response) => {
      const { Body, ContentType, ContentLength } = response

      if (!Body) {
        throw new HTTPException(404, { message: 'Cover not found' })
      }

      c.header('Content-Type', ContentType || 'application/octet-stream')
      c.header('Content-Length', ContentLength?.toString() || '')
      return c.body(Body.transformToWebStream())
    })
    .catch((error) => {
      if (error.name === 'NoSuchKey') {
        throw new HTTPException(404, { message: 'Cover not found' })
      }
      throw new HTTPException(500, { message: 'Error getting cover' })
    })
})

uploadsRoutes.post(
  '/chapters/:id/pages',
  ...authHandlers(),
  zValidator('form', PagesUploadInput),
  async (c) => {
    c.get('ability')('create', 'Chapter')
    const id = c.req.param('id')
    const chapter = await db.chapter.findUnique({ where: { id } })
    if (!chapter) {
      throw new HTTPException(404, { message: 'Chapter not found' })
    }

    const { 'pages[]': pages } = c.req.valid('form')
    const directory = `projects/${chapter.projectId}/chapters/${id}`
    const listPages = []

    for (const page of pages) {
      const pageArrayBuffer = await page.arrayBuffer()
      const pageUint8Array = new Uint8Array(pageArrayBuffer)
      const key = `${directory}/${page.name}`

      try {
        await putObject(key, pageUint8Array, page.type)
        listPages.push(page.name)
      } catch (error) {
        await deleteObject(directory)
        throw new HTTPException(500, { message: 'Failed to upload pages' })
      }
    }

    await db.chapter.update({
      data: { pages: listPages },
      where: { id },
    })

    return c.json('Pages uploaded', 201)
  },
)

uploadsRoutes.get(
  '/chapters/:id/pages/:pageName',
  ...authHandlers(true),
  async (c) => {
    c.get('ability')('readDetails', 'Chapter')
    const id = c.req.param('id')
    const pageName = c.req.param('pageName')
    const chapter = await db.chapter.findUnique({ where: { id } })
    if (!chapter) {
      throw new HTTPException(404, { message: 'Chapter not found' })
    }

    const directoryKey = `projects/${chapter.projectId}/chapters/${chapter.id}`
    const key = `${directoryKey}/${pageName}`

    return getObject(key)
      .then(async (response) => {
        const { Body, ContentType, ContentLength } = response

        if (!Body) {
          throw new HTTPException(404, { message: 'Page not found' })
        }

        c.header('Content-Type', ContentType || 'application/octet-stream')
        c.header('Content-Length', ContentLength?.toString() || '')
        return c.body(Body.transformToWebStream())
      })
      .catch((error) => {
        if (error.name === 'NoSuchKey') {
          throw new HTTPException(404, { message: 'Page not found' })
        }
        throw new HTTPException(500, { message: 'Error getting page' })
      })
  },
)

export { uploadsRoutes }
