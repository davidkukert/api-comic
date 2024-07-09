import { env } from '@/env'
import { Hono } from 'hono'
import { usersRoutes } from './routes/users'
import { projectsRoutes } from './routes/projects'
import { chaptersRoutes } from './routes/chapters'
import { tagsRoutes } from './routes/tags'
import { authRoutes } from './auth/routes'

const app = new Hono()

app.route('/users', usersRoutes)
app.route('/projects', projectsRoutes)
app.route('/chapters', chaptersRoutes)
app.route('/tags', tagsRoutes)
app.route('/auth', authRoutes)

export default {
  port: env.API_PORT,
  fetch: app.fetch,
}
