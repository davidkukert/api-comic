import { env } from '@/env'
import { Hono } from 'hono'
import { usersRoutes } from './routes/users'
import { projectsRoutes } from './routes/projects'
import { chaptersRoutes } from './routes/chapters'
import { tagsRoutes } from './routes/tags'

const app = new Hono()

app.route('/users', usersRoutes)
app.route('/projects', projectsRoutes)
app.route('/chapters', chaptersRoutes)
app.route('/tags', tagsRoutes)

export default {
  port: env.API_PORT,
  fetch: app.fetch,
}
