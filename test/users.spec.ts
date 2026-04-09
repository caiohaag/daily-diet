import { it, afterAll, beforeAll, describe } from 'vitest'
import { app } from '../src/app'
import request from 'supertest'
import { knex } from '../src/database'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
    await knex.migrate.latest()
  })

  afterAll(async () => {
    await app.close()
  })

  it('Should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        email: 'caiohaag@gmail.com',
        password: 'Abc12345',
      })
      .expect(201)
  })

  it('Should not be able to create a new user with duplicate email', async () => {
    await request(app.server).post('/users').send({
      email: 'caiohaag@gmail.com',
      password: 'Abc12345',
    })
    await request(app.server)
      .post('/users')
      .send({
        email: 'caiohaag@gmail.com',
        password: 'Abc12345',
      })
      .expect(409)
  })

  it('Should not be able to create a new user with incorrect password pattern', async () => {
    await request(app.server)
      .post('/users')
      .send({
        email: 'caiohaag@gmail.com',
        password: 'abc123',
      })
      .expect(500)
  })

  it('Should be able to login', async () => {
    await request(app.server).post('/users').send({
      email: 'caiohaag@gmail.com',
      password: 'Abc12345',
    })

    await request(app.server)
      .post('/users/login')
      .send({
        email: 'caiohaag@gmail.com',
        password: 'Abc12345',
      })
      .expect(200)
  })

  it('Should be able to login with wrong email', async () => {
    await request(app.server).post('/users').send({
      email: 'caiohaag@gmail.com',
      password: 'Abc12345',
    })

    await request(app.server)
      .post('/users/login')
      .send({
        email: 'caiohaag2@gmail.com',
        password: 'Abc12345',
      })
      .expect(401)
  })

  it('Should not be able to login with wrong password', async () => {
    await request(app.server).post('/users').send({
      email: 'caiohaag@gmail.com',
      password: 'Abc12345',
    })

    await request(app.server)
      .post('/users/login')
      .send({
        email: 'caiohaag@gmail.com',
        password: 'Abc123456',
      })
      .expect(401)
  })

  it('Should be able to logout', async () => {
    const agent = request.agent(app.server)

    await agent.post('/users').send({
      email: 'caiohaag@gmail.com',
      password: 'Abc12345',
    })

    await agent.post('/users/login').send({
      email: 'caiohaag@gmail.com',
      password: 'Abc12345',
    })

    await agent.post('/users/logout').expect(200)
  })
})
