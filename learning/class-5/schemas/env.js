import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const envSchema = z.object({
  DB_HOST: z.string().nonempty(),
  DB_USER: z.string().nonempty(),
  DB_PASSWORD: z.string().nonempty(),
  DB_NAME: z.string().nonempty(),
  DB_PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('3306'),
  DB_CONNECTION_LIMIT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default('10')
})

export const env = envSchema.parse(process.env)
