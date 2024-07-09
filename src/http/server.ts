import { env } from '@/env'
import { Hono } from 'hono'
import { usersRoutes } from './routes/users'

const app = new Hono()

app.route('/users', usersRoutes)

export default {
  port: env.API_PORT,
  fetch: app.fetch,
}
