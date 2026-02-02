import { Pool } from 'pg'
import { config } from '../config/index.js'

class Database {
  private pool: Pool

  constructor() {
    this.pool = new Pool({
      host: config.db.host,
      port: config.db.port,
      database: config.db.database,
      user: config.db.user,
      password: config.db.password,
      max: config.db.max,
      idleTimeoutMillis: config.db.idleTimeoutMillis,
      connectionTimeoutMillis: config.db.connectionTimeoutMillis
    })

    this.pool.on('connect', () => {
      console.log('✅ Database connected successfully')
    })

    this.pool.on('error', (err) => {
      console.error('❌ Database connection error:', err.message)
    })
  }

  async query(text: string, params?: any[]) {
    const start = Date.now()
    try {
      const result = await this.pool.query(text, params)
      const duration = Date.now() - start
      console.log('🔍 Query executed:', { text, duration: `${duration}ms`, rows: result.rowCount })
      return result
    } catch (error) {
      console.error('❌ Query failed:', { text, error })
      throw error
    }
  }

  async getClient() {
    return await this.pool.connect()
  }

  async close() {
    await this.pool.end()
    console.log('🔌 Database connection closed')
  }
}

export const db = new Database()
