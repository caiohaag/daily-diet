import { it, afterAll, beforeAll, describe, expect, afterEach } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'
import { knex } from '../src/database'

describe('Meals routes', () => {
  const agent = request.agent(app.server)
  beforeAll(async () => {
    await knex.migrate.latest()
    await app.ready()
    await agent.post('/users').send({
      email: 'caiohaag@gmail.com',
      password: 'Abc12345',
    })

    await agent.post('/users/login').send({
      email: 'caiohaag@gmail.com',
      password: 'Abc12345',
    })
  })

  afterEach(async () => {
    await knex('meals').delete()
  })

  afterAll(async () => {
    await agent.post('/users/logout').send()
    await app.close()
  })

  it('Should be able get meal list', async () => {
    await agent.post('/meals').send({
      name: 'Almoço',
      description: 'Arroz, feijão e carne',
      date: '09/04/2026',
      time: '12:00',
      isDiet: true,
    })

    const listMealsResponse = await agent.get('/meals').expect(200)

    expect(listMealsResponse.body.meals).toMatchObject([
      expect.objectContaining({
        name: 'Almoço',
        description: 'Arroz, feijão e carne',
        is_diet: 1,
      }),
    ])
  })

  it('Should be able get a single meal', async () => {
    await agent.post('/meals').send({
      name: 'Almoço',
      description: 'Arroz, feijão e carne',
      date: '09/04/2026',
      time: '12:00',
      isDiet: true,
    })

    const listMealsResponse = await agent.get('/meals')

    const { id } = listMealsResponse.body.meals[0]

    const singleMeal = await agent.get(`/meals/${id}`)

    expect(singleMeal.body).toMatchObject(
      expect.objectContaining({
        name: 'Almoço',
        description: 'Arroz, feijão e carne',
        is_diet: 1,
      }),
    )
  })

  it('Should be able get metrics', async () => {
    await agent.post('/meals').send({
      name: 'Almoço',
      description: 'Arroz, feijão e carne',
      date: '09/04/2026',
      time: '12:00',
      isDiet: true,
    })

    const metricsResponse = await agent.get('/meals/metrics')

    expect(metricsResponse.body).toMatchObject(
      expect.objectContaining({
        totalMeals: 1,
        totalIsDiet: 1,
        totalIsNotDiet: 0,
        dietMaxStreak: 1,
      }),
    )
  })

  it('Should be able to create a meal', async () => {
    await agent
      .post('/meals')
      .send({
        name: 'Almoço',
        description: 'Arroz, feijão e carne',
        date: '09/04/2026',
        time: '12:00',
        isDiet: true,
      })
      .expect(201)
  })

  it('Should not be able to list meals when not logged', async () => {
    await agent.post('/users/logout').send()

    await agent.get('/meals').expect(401)
  })
})
