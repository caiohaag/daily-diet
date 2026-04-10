import type { FastifyInstance } from 'fastify'
import { knex } from '../database'
import z from 'zod'
import bcrypt from 'bcrypt'

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (req, reply) => {
    const createUserSchema = z.object({
      email: z.email(),
      password: z
        .string()
        .min(8, { message: 'A senha deve conter ao menos 8 caracteres' })
        .regex(/[A-Z]/, {
          message: 'A senha deve conter ao menos uma letra maiúscula',
        })
        .regex(/[a-z]/, {
          message: 'A senha deve conter ao menos uma letra minúscula',
        })
        .regex(/[0-9]/, {
          message: 'A senha deve conter ao menos um número',
        }),
    })
    const { email, password } = createUserSchema.parse(req.body)

    const emailUsed = await knex('users').where('email', email).first()

    if (emailUsed) {
      return reply.status(409).send({
        error: 'Este e-mail já foi utilizado',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    try {
      await knex('users').insert({
        id: crypto.randomUUID(),
        email,
        password_hash: passwordHash,
      })
    } catch {
      return reply.status(500).send({ error: 'Database error' })
    }

    return reply.status(201).send({
      message: 'Usuário criado com sucesso',
    })
  })

  app.post('/login', async (req, reply) => {
    const loginUserSchema = z.object({
      email: z.email(),
      password: z.string(),
    })

    const { email, password } = loginUserSchema.parse(req.body)

    const user = await knex('users').where({ email }).first()

    if (!user) {
      return reply.status(401).send({ error: 'Credenciais inválidas' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return reply.status(401).send({ error: 'Credenciais inválidas' })
    }

    const sessionId = crypto.randomUUID()

    try {
      await knex('sessions').insert({
        id: sessionId,
        user_id: user.id,
      })
    } catch {
      return reply.status(500).send({ error: 'Database error' })
    }

    reply
      .cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,
      })
      .status(200)
      .send({
        message: 'Login efetuado com sucesso',
      })
  })

  app.post('/logout', async (req, reply) => {
    const sessionId = req.cookies.sessionId

    await knex('sessions').where({ id: sessionId }).delete()

    reply
      .clearCookie('sessionId')
      .send({ message: 'Logout realizado com sucesso' })
  })
}
