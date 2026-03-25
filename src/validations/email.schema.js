import { z } from 'zod'

const commonTypos = ['gmial.com', 'gmai.com', 'yahooo.com', 'hotmial.com']
const disposable = [
  'tempmail.com',
  'throwaway.email',
  '10minutemail.com',
  'guerrillamail.com'
]

export const emailSchema = z
  .email({
    required_error: 'Email is required',
    invalid_type_error: 'Email must be a string',
    message: 'Invalid email format'
  })
  .trim()
  .toLowerCase()
  .max(255, { message: 'Email is too long' })
  .refine(
    (email) => {
      const domain = email.split('@')[1]
      return domain ? !commonTypos.includes(domain) : true
    },
    {
      message: 'Verify that the email domain is correctly spelled'
    }
  )
  .refine(
    (email) => {
      const domain = email.split('@')[1]
      return domain ? !disposable.includes(domain) : true
    },
    {
      message: 'Please use a permanent email address'
    }
  )
