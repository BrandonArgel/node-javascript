import http from 'node:http'
import fs from 'node:fs/promises'

const port = process.env.PORT ?? 3000

const processRequest = async (req, res) => {
  if (req.url === '/') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Welcome to the homepage!')
  } else if (req.url === '/image') {
    try {
      const data = await fs.readFile('./photo.jpg')
      res.setHeader('Content-Type', 'image/jpeg')
      res.end(data)
    } catch (err) {
      res.statusCode = 500
      res.end('Error occurred while reading the image.')
    }
  } else if (req.url === '/about') {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('This is the about page.')
  } else {
    res.statusCode = 404
    res.end('Page not found.')
  }
}

const server = http.createServer(processRequest)

server.listen(port, () => {
  const url = `http://localhost:${port}`
  console.log(`Server listening on ${url}`)
})
