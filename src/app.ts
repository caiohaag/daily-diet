import fastify from 'fastify'
import { userRoutes } from './routes/user.js'

export const app = fastify()

app.register(userRoutes, {
  prefix: '/users',
})
