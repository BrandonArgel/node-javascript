import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'

const dittoJSON = JSON.parse(
  readFileSync(new URL('./pokemon/ditto.json', import.meta.url), 'utf8')
)

const processRequest = (req, res) => {
  const { method, url } = req

  switch (method) {
    case 'GET':
      switch (url) {
        case '/pokemon/ditto':
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          return res.end(JSON.stringify(dittoJSON))
        default:
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/html; charset=utf-8')
          return res.end('<h1>404</h1>')
      }

    case 'POST':
      switch (url) {
        case '/pokemon': {
          let body = ''

          // listen to the data event to receive the request body in chunks
          req.on('data', (chunk) => {
            body += chunk.toString()
          })

          req.on('end', () => {
            const data = JSON.parse(body)
            // call the database to save the data, then return a response
            res.writeHead(201, {
              'Content-Type': 'application/json; charset=utf-8'
            })

            data.timestamp = Date.now()
            res.end(JSON.stringify(data))
          })

          break
        }

        default:
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          return res.end('404 Not Found')
      }
  }
}

const server = createServer(processRequest)

server.listen(3000, () => {
  console.log('server listening on port http://localhost:3000')
})
