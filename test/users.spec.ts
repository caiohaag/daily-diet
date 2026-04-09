import { it, afterAll, beforeAll, beforeEach, describe } from 'vitest'
import { app } from '../src/app'
import { execSync } from 'node:child_process'
import { knex } from '../src/database'
import request from 'supertest'

describe('Users routes', () => {
  beforeAll(async () => {
    app.ready()
    execSync('npm run knex migrate:latest')
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await knex('users').delete()
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
})
