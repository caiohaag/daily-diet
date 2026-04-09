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
        message: 'Este e-mail já foi utilizado',
      })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await knex('users').insert({
      id: crypto.randomUUID(),
      email,
      password_hash: passwordHash,
      created_at: new Date(),
    })

    return reply.status(201).send({
      message: 'Usuário criado com sucesso',
    })
  })
}
