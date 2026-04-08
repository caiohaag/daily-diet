import fastify from 'fastify'
import { loginRoutes } from './routes/login.js'

export const app = fastify()

app.register(loginRoutes)
