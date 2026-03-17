import express from 'express'
import crypto from 'crypto'
import cors from 'cors'
import { validateMovie, validatePartialMovie } from './schemas/movies.js'
import movies from './movies.json' with { type: 'json' }

const PORT = process.env.PORT || 3000

// 1. Import with try-catch to handle potential errors (e.g., file not found, invalid JSON)
// import fs from 'node:fs'
// let movies = []

// try {
//   const fileData = fs.readFileSync('./movies.json', 'utf-8')
//   movies = JSON.parse(fileData)
// } catch (error) {
//   console.error('Error reading movies.json:', error)
// }

// 2. Use dynamic import to load the movies data, which allows for better error handling and can be used in an async context
// import fs from 'node:fs'
// const movies = JSON.parse(fs.readFileSync('./movies.json', 'utf-8'))

// 3. Create a utility function to load movies, which can be called at startup and whenever the data needs to be refreshed
// import { createRequire } from 'node:module'
// const require = createRequire(import.meta.url)
// const movies = require('./movies.json')

const app = express()
app.use(express.json())
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        'http://localhost:8080',
        'http://localhost:1234',
        'http://localhost:3000'
      ]

      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true)
      }

      if (!origin) {
        return callback(null, true)
      }

      return callback(new Error('Not allowed by CORS'))
    }
  })
)
app.disable('x-powered-by') // Disable the X-Powered-By header for security reasons

app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' })
})

// All resources that are MOVIES are identified by the /movies path
app.get('/movies', (req, res) => {
  // 1. Destructure the expected query parameters
  const { genre, year, director, minRate, page = 1, limit = 10 } = req.query

  // 2. Filter the movies array in a single pass
  const filteredMovies = movies.filter((movie) => {
    // Start by assuming the movie matches
    let isValid = true

    // Filter by Genre (Case-insensitive)
    if (genre && isValid) {
      const requestedGenres = Array.isArray(genre) ? genre : [genre]

      isValid = requestedGenres.some((reqGenre) =>
        movie.genre.some(
          (movieGenre) => movieGenre.toLowerCase() === reqGenre.toLowerCase()
        )
      )
    }

    // Filter by Year (Exact match, parse to Integer)
    if (year && isValid) {
      isValid = movie.year === parseInt(year, 10)
    }

    // Filter by Director (Partial, case-insensitive match)
    if (director && isValid) {
      isValid = movie.director.toLowerCase().includes(director.toLowerCase())
    }

    // Filter by Minimum Rate (Greater than or equal, parse to Float)
    if (minRate && isValid) {
      isValid = movie.rate >= parseFloat(minRate)
    }

    // If isValid is still true, the movie passes all applied filters
    return isValid
  })

  // --- PAGINATION LOGIC ---
  // 3. Parse pagination values to integers
  const pageNumber = parseInt(page, 10)
  const limitNumber = parseInt(limit, 10)

  // 4. Calculate start and end indexes
  const startIndex = (pageNumber - 1) * limitNumber
  const endIndex = pageNumber * limitNumber

  // 5. Slice the filtered array
  const paginatedMovies = filteredMovies.slice(startIndex, endIndex)

  // --- RESPONSE FORMATTING ---
  // 6. Return an object with metadata and the actual data
  res.json({
    info: {
      totalItems: filteredMovies.length,
      totalPages: Math.ceil(filteredMovies.length / limitNumber),
      currentPage: pageNumber,
      limit: limitNumber
    },
    results: paginatedMovies
  })
})

// Get a specific movie by ID
// :id is a path parameter, it can be accessed via req.params (path-to-regexp)
app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find((movie) => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).send('Movie not found')
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }

  movies.push(newMovie)

  try {
    fs.writeFileSync('./movies.json', JSON.stringify(movies, null, 2))
    res.status(201).json(newMovie)
  } catch (error) {
    res.status(500).json({ error: 'Failed to save the movie' })
  }
})

app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  console.log({ id, movieIndex, movies })
  if (movieIndex === -1) {
    return res.status(404).send('Movie not found')
  }

  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors })
  }

  // Update only the provided fields
  movies[movieIndex] = { ...movies[movieIndex], ...result.data }

  try {
    fs.writeFileSync('./movies.json', JSON.stringify(movies, null, 2))
    res.json(movies[movieIndex])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update the movie' })
  }
})

app.use((req, res) => {
  res.status(404).send('404 Not Found')
})

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
