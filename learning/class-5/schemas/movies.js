import z from 'zod'

export const validateMovieQuery = (query) => {
  const querySchema = z.object({
    genres: z.union([z.string(), z.array(z.string())]).optional(),
    year: z.coerce
      .number()
      .int()
      .min(1888)
      .max(new Date().getFullYear())
      .optional(),
    directors: z.union([z.string(), z.array(z.string())]).optional(),
    minRate: z.coerce.number().min(0).max(10).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
  })

  return querySchema.safeParse(query)
}

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required.'
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  }),
  genres: z.array(
    z.enum([
      'Action',
      'Adventure',
      'Crime',
      'Comedy',
      'Drama',
      'Fantasy',
      'Horror',
      'Thriller',
      'Sci-Fi'
    ]),
    {
      required_error: 'Movie genre is required.',
      invalid_type_error: 'Movie genre must be an array of enum Genre'
    }
  )
})

export function validateMovie(input) {
  return movieSchema.safeParse(input)
}

export function validatePartialMovie(input) {
  return movieSchema.partial().safeParse(input)
}
