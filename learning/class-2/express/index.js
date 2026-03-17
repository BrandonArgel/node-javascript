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

// middleware to parse JSON bodies
app.use(express.json())

// app.use((req, res, next) => {
//   if (req.method !== 'POST') return next()
//   if (req.headers['content-type'] !== 'application/json') return next()

//   // only for POST requests with content-type application/json
//   let body = ''

//   // escuchar el evento data
//   req.on('data', chunk => {
//     body += chunk.toString()
//   })

//   req.on('end', () => {
//     const data = JSON.parse(body)
//     data.timestamp = Date.now()
//     // mutar la request y meter la información en el req.body
//     req.body = data
//     next()
//   })
// })

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
