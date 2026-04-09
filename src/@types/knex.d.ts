// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      email: string
      password_hash: string
      created_at: date
    }
    sessions: {
      id: string
      user_id: string
      created_at: date
    }
    meals: {
      id: string
      user_id: string
      name: string
      description: string | undefined
      is_diet: boolean
      date_time: date
      created_at: date
      modified_at: date
    }
  }
}
