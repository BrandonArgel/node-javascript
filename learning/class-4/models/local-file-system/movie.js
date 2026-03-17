import { randomUUID } from 'node:crypto'
import movies from '../../movies.json' with { type: 'json' }

export class MovieModel {
  static async getAll({
    genre,
    year,
    director,
    minRate,
    page = 1,
    limit = 10
  }) {
    // 1. Filter the movies array in a single pass
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
    // 2. Parse pagination values to integers
    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)

    // 3. Calculate start and end indexes
    const startIndex = (pageNumber - 1) * limitNumber
    const endIndex = pageNumber * limitNumber

    // 4. Slice the filtered array
    const paginatedMovies = filteredMovies.slice(startIndex, endIndex)

    // --- RESPONSE FORMATTING ---
    // 5. Return an object with the actual data
    return {
      info: {
        totalItems: filteredMovies.length,
        totalPages: Math.ceil(filteredMovies.length / limitNumber),
        currentPage: pageNumber,
        limit: limitNumber
      },
      results: paginatedMovies
    }
  }

  static async getById({ id }) {
    const movie = movies.find((movie) => movie.id === id)
    return movie
  }

  static async create({ input }) {
    const newMovie = {
      id: randomUUID(),
      ...input
    }

    movies.push(newMovie)

    return newMovie
  }

  static async delete({ id }) {
    const movieIndex = movies.findIndex((movie) => movie.id === id)
    if (movieIndex === -1) return false

    movies.splice(movieIndex, 1)
    return true
  }

  static async update({ id, input }) {
    const movieIndex = movies.findIndex((movie) => movie.id === id)
    if (movieIndex === -1) return false

    movies[movieIndex] = {
      ...movies[movieIndex],
      ...input
    }

    return movies[movieIndex]
  }
}
