import type { FastifyInstance } from 'fastify'

export async function loginRoutes(app: FastifyInstance) {
  app.get('/hello', (req, res) => {
    console.log('hello world')

    res.send('hello world')
  })
}
