import express from 'express'
import { readFileSync } from 'node:fs'

const dittoJSON = JSON.parse(
  readFileSync(
    new URL('../routing/pokemon/ditto.json', import.meta.url),
    'utf8'
  )
)

const PORT = process.env.PORT || 3000

const app = express()
app.disable('x-powered-by')

app.use(express.json())

app.get('/pokemon/ditto', (req, res) => {
  res.json(dittoJSON)
})

app.post('/pokemon', (req, res) => {
  const data = req.body
  data.timestamp = Date.now()
  res.status(201).json(data)
})

app.use((req, res) => {
  res.status(404).send('<h1>404 Not Found</h1>')
})

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
