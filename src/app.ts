import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { userRoutes } from './routes/user.js'
import { mealsRoutes } from './routes/meals.js'

export const app = fastify()

app.register(cookie)
app.register(userRoutes, {
  prefix: '/users',
})
app.register(mealsRoutes, {
  prefix: '/meals',
})
