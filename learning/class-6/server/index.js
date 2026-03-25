import express from 'express'
import logger from 'morgan'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Server } from 'socket.io'
import { createClient } from '@libsql/client'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000

const app = express()
app.use(logger('dev'))
const server = createServer(app)
const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000 // 2 minutes
  }
})

const db = createClient({
  url: process.env.DB_URL,
  authToken: process.env.DB_TOKEN
})

await db.execute(`
  CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  username TEXT NOT NULL DEFAULT 'anonymous',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
)`)

// Migrate existing tables that were created without these columns
try {
  await db.execute(`ALTER TABLE messages ADD COLUMN created_at TEXT DEFAULT '1970-01-01T00:00:00Z'`)
} catch (_) { /* column already exists */ }

try {
  await db.execute(`ALTER TABLE messages ADD COLUMN username TEXT DEFAULT 'anonymous'`)
} catch (_) { /* column already exists */ }

// Reject connections that don't provide a username
io.use((socket, next) => {
  const username = socket.handshake.auth.username?.trim()
  if (!username) {
    return next(new Error('Username is required'))
  }
  socket.username = username
  next()
})

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, '../client/index.html'))
})

io.on('connection', async (socket) => {
  console.log(`${socket.username} connected`)

  socket.on('chat message', async (msg) => {
    let result
    try {
      result = await db.execute({
        sql: 'INSERT INTO messages (content, username) VALUES (:msg, :username)',
        args: { msg, username: socket.username }
      })
    } catch (error) {
      console.error('Error inserting message:', error)
      return
    }

    const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
    io.emit('chat message', msg, result.lastInsertRowid.toString(), now, socket.username)

    console.log(`[${socket.username}]: ${msg}`)
  })

  socket.on('recover messages', async (lastId) => {
    console.log(`${socket.username} recovering messages since ID: ${lastId}`)
    let messages

    if (!lastId || lastId === 0) {
      messages = await db.execute(`
      SELECT id, content, created_at, username
      FROM messages
      ORDER BY id DESC
      LIMIT 50
    `)

      messages.rows.reverse()

      messages.rows.forEach((row) => {
        socket.emit('chat message', row.content, row.id, row.created_at, row.username)
      })

      socket.emit('initial messages done')

      return
    }

    messages = await db.execute({
      sql: 'SELECT id, content, created_at, username FROM messages WHERE id > :lastId ORDER BY id ASC',
      args: { lastId }
    })

    messages.rows.forEach((row) => {
      socket.emit('chat message', row.content, row.id, row.created_at, row.username)
    })
  })

  socket.on('load more messages', async (beforeId) => {
    const messages = await db.execute({
      sql: `
      SELECT id, content, created_at, username
      FROM messages
      WHERE id < :beforeId
      ORDER BY id DESC
      LIMIT 50
    `,
      args: { beforeId }
    })

    socket.emit('older messages', messages.rows)
  })

  socket.on('disconnect', () => {
    console.log(`${socket.username} disconnected`)
  })
})

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`)
})
