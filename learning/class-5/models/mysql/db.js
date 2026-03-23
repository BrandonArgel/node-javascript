import mysql from 'mysql2/promise'
import { env } from '../../schemas/env.js'

const pool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  port: env.DB_PORT,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: env.DB_CONNECTION_LIMIT,
  queueLimit: 0
})

export { pool }
