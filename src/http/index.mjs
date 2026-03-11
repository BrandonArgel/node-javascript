import http from 'node:http'
import { findAvailablePort } from '../free-port/index.mjs'

const port = process.env.PORT ?? 3000

const server = http.createServer((req, res) => {
  console.log('Request received')
  res.end('Hello world')
})

findAvailablePort(port).then((port) => {
  const url = `http://localhost:${port}`

  server.listen(port, () => {
    console.log(`Sever listening on port ${url}`)
  })
})

// server.listen(0, () => {
//   console.log(
//     `Sever listening on port http://localhost:${server.address().port}`
//   )
// })
