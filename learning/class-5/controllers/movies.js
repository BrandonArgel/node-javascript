// import { MovieModel } from '../models/local-file-system/movie.js'
// import { MovieModel } from '../models/mongodb/movie.js'
import { MovieModel } from '../models/mysql/movie.js'
import {
  validateMovieQuery,
  validateMovie,
  validatePartialMovie
} from '../schemas/movies.js'

export class MovieController {
  static async getAll(req, res) {
    try {
      const validationResult = validateMovieQuery(req.query)
      console.log('Validation result:', validationResult, req.query)

      if (!validationResult.success) {
        return res
          .status(400)
          .json({ error: JSON.parse(validationResult.error.message) })
      }

      const { page, limit } = validationResult.data

      const modelResult = await MovieModel.getAll(validationResult.data)

      const totalRecords = modelResult.totalRecords
      const totalPages = Math.ceil(totalRecords / limit)

      const hasNextPage = page < totalPages
      const hasPreviousPage = page > 1

      res.json({
        data: modelResult.movies,
        meta: {
          totalRecords,
          currentPage: page,
          totalPages,
          hasNextPage,
          hasPreviousPage
        }
      })
    } catch (error) {
      console.error('Error in getAll:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  static async getById(req, res) {
    const { id } = req.params
    const movie = await MovieModel.getById({ id })
    if (movie) return res.json(movie)
    res.status(404).json({ message: 'Movie not found' })
  }

  static async create(req, res) {
    const result = validateMovie(req.body)

    if (!result.success) {
      // 422 Unprocessable Entity
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = await MovieModel.create({ input: result.data })

    res.status(201).json(newMovie)
  }

  static async delete(req, res) {
    const { id } = req.params

    const result = await MovieModel.delete({ id })

    if (result === false) {
      return res.status(404).json({ message: 'Movie not found' })
    }

    return res.json({ message: 'Movie deleted' })
  }

  static async update(req, res) {
    const result = validatePartialMovie(req.body)

    if (!result.success) {
      return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params

    const updatedMovie = await MovieModel.update({ id, input: result.data })

    return res.json(updatedMovie)
  }
}
