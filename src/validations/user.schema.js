import { z } from 'zod'
import { emailSchema } from './email.schema.js'

const userSchema = z
  .string({
    required_error: 'Username is required',
    invalid_type_error: 'Username must be a string'
  })
  .min(3, 'Username cannot be less than 3 characters')

const passwordSchema = z
  .string({
    required_error: 'Password is required'
  })
  .min(8, 'Password cannot be less than 8 characters')

export const registerUserSchema = z.object({
  username: userSchema,
  email: emailSchema,
  password: passwordSchema
})

export const loginUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema
})
