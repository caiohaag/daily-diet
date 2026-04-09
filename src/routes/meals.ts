import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import z from 'zod'
import { parseDate } from '../utils/parseDate'
import { countDietStreak } from '../utils/countDietStreak'

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
    const createMealSchema = z.object({
      name: z.string(),
      description: z.string().optional(),
      date: z.string(),
      time: z.string(),
      isDiet: z.boolean(),
    })

    const { name, description, date, time, isDiet } = createMealSchema.parse(
      req.body,
    )

    const dateTime = parseDate(date, time)

    await knex('meals').insert({
      id: crypto.randomUUID(),
      user_id: req.userId,
      name,
      description,
      date_time: dateTime,
      is_diet: isDiet,
    })

    return reply.status(201).send({
      message: 'Refeição criada com sucesso',
    })
  })
}
