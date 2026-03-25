import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'node:path'
import { logger } from '#config/logger.js'
import { PORT } from '#config/env.js'
import { userRouter } from '#routes/user.routes.js'
import { checkAuth } from '#middlewares/checkAuth.js'
import { requireAuth } from '#middlewares/requireAuth.js'
import { getDirname } from '#utils/paths.js'

const app = express()

const __dirname = getDirname(import.meta.url)

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.json())
app.use(cookieParser())

app.use(checkAuth)

app.get('/', (req, res) => {
  return res.render('index')
})

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy'
  })
})

app.use('/users', userRouter)

app.get('/protected', requireAuth, (req, res) => {
  res.render('protected', req.user)
})

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`)
})
