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
  }
}
