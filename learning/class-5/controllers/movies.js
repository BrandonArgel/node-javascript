import {
  validateMovieQuery,
  validateMovie,
  validatePartialMovie
} from '../schemas/movies.js'

export class MovieController {
  constructor({ movieModel }) {
    this.movieModel = movieModel
  }

  getAll = async (req, res) => {
    try {
      const validationResult = validateMovieQuery(req.query)

      if (!validationResult.success) {
        return res
          .status(400)
          .json({ error: JSON.parse(validationResult.error.message) })
      }

      const { page, limit } = validationResult.data

      const modelResult = await this.movieModel.getAll(validationResult.data)

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

  getById = async (req, res) => {
    try {
      const { id } = req.params
      const movie = await this.movieModel.getById({ id })
      if (movie) return res.json(movie)
      res.status(404).json({ message: 'Movie not found' })
    } catch (error) {
      console.error('Error in getById:', error)
      res.status(500).json({ message: error || 'Internal server error' })
    }
  }

  create = async (req, res) => {
    try {
      const result = validateMovie(req.body)

      if (!result.success) {
        // 422 Unprocessable Entity
        return res.status(422).json({ error: JSON.parse(result.error.message) })
      }

      const newMovie = await this.movieModel.create({ input: result.data })

      res.status(201).json(newMovie)
    } catch (error) {
      console.error('Error in create:', error)
      res.status(500).json({ message: error || 'Internal server error' })
    }
  }

  update = async (req, res) => {
    try {
      const result = validatePartialMovie(req.body)

      if (!result.success) {
        return res.status(422).json({ error: JSON.parse(result.error.message) })
      }

      const { id } = req.params

      const updatedMovie = await this.movieModel.update({
        id,
        input: result.data
      })

      return res.json(updatedMovie)
    } catch (error) {
      console.error('Error in update:', error)
      res.status(500).json({ message: error || 'Internal server error' })
    }
  }

  delete = async (req, res) => {
    try {
      const { id } = req.params

      const result = await this.movieModel.delete({ id })

      if (result === false) {
        return res.status(404).json({ message: 'Movie not found' })
      }

      return res.json({ message: 'Movie deleted' })
    } catch (error) {
      console.error('Error in delete:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}
