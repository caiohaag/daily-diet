import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import z from 'zod'
import { parseDate } from '../utils/parseDate'
import { countDietStreak } from '../utils/countDietStreak'

const mealSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  date: z.string(),
  time: z.string(),
  isDiet: z.boolean(),
})

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req, reply) => {
    const sessionId = req.cookies.sessionId

    if (!sessionId) {
      return reply.status(401).send({ message: 'Acesso não autorizado' })
    }

    const session = await knex('sessions').where({ id: sessionId }).first()

    if (!session) {
      return reply.status(401).send({ message: 'Sessão inválida' })
    }

    req.userId = session.user_id
  })

  app.get('/', async (req, reply) => {
    const allMeals = await knex('meals')
      .where({ user_id: req.userId })
      .orderBy('date_time', 'asc')

    return reply.send({
      meals: allMeals,
    })
  })

  app.get('/:id', async (req, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const { id } = getMealParamsSchema.parse(req.params)
    const meal = await knex('meals').where({ user_id: req.userId, id }).first()

    if (!meal) {
      return reply.status(404).send('Refeição não encontrada')
    }

    return reply.send(meal)
  })

  app.get('/metrics', async (req, reply) => {
    const allMeals = await knex('meals')
      .where({ user_id: req.userId })
      .orderBy('date_time', 'asc')

    const totalMeals = allMeals.length
    let totalIsDiet = 0
    let totalIsNotDiet = 0

    for (const meal of allMeals) {
      if (meal.is_diet) {
        totalIsDiet++
      } else {
        totalIsNotDiet++
      }
    }
    const dietMaxStreak = countDietStreak(allMeals)

    return reply.send({
      totalMeals,
      totalIsDiet,
      totalIsNotDiet,
      dietMaxStreak,
    })
  })

  app.post('/', async (req, reply) => {
    const { name, description, date, time, isDiet } = mealSchema.parse(req.body)

    const dateTime = parseDate(date, time)

    try {
      await knex('meals').insert({
        id: crypto.randomUUID(),
        user_id: req.userId,
        name,
        description,
        date_time: dateTime,
        is_diet: isDiet,
      })
    } catch {
      return reply.status(500).send({ error: 'Database error' })
    }

    return reply.status(201).send({
      message: 'Refeição criada com sucesso',
    })
  })

  app.put('/:id', async (req, reply) => {
    const paramsSchema = z.object({ id: z.uuid() })
    const { id } = paramsSchema.parse(req.params)
    const { name, description, date, time, isDiet } = mealSchema.parse(req.body)

    const dateTime = parseDate(date, time)

    try {
      const updatedMeal = await knex('meals').where({ id }).update({
        name,
        description,
        date_time: dateTime,
        is_diet: isDiet,
        modified_at: knex.fn.now(),
      })
      if (updatedMeal === 0) {
        return reply
          .status(404)
          .send({ error: 'Não foi encontrada a refeição com este ID' })
      }
    } catch {
      return reply.status(500).send({ error: 'Database error' })
    }

    return reply.status(204).send()
  })

  app.delete('/:id', async (req, reply) => {
    const paramsSchema = z.object({ id: z.uuid() })
    const { id } = paramsSchema.parse(req.params)

    try {
      const deletedMeal = await knex('meals').where({ id }).delete()
      if (deletedMeal === 0) {
        return reply
          .status(404)
          .send({ error: 'Não foi encontrada a refeição com este ID' })
      }
    } catch {
      return reply.status(500).send({ error: 'Database error' })
    }

    return reply.status(204).send()
  })
}
