import { Router } from 'express'
import { UserRepository } from '#repositories/UserRepository.js'
import { generateAccessToken, generateRefreshToken } from '#utils/jwt.js'
import {
  registerUserSchema,
  loginUserSchema
} from '#validations/user.schema.js'
import { validateSchema } from '#middlewares/validateSchema.js'
import { logger } from '#config/logger.js'

export const userRouter = Router()

userRouter.post(
  '/register',
  validateSchema(registerUserSchema),
  async (req, res) => {
    try {
      const newUser = await UserRepository.create(req.body)

      res.status(201).json({
        success: true,
        data: newUser
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }
)

userRouter.post('/login', validateSchema(loginUserSchema), async (req, res) => {
  try {
    const user = await UserRepository.login(req.body)

    const payload = { id: user._id, username: user.username, email: user.email }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    const cookieOptions = {
      httpOnly: true, // Can't be accessed by client-side JavaScript
      secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
      sameSite: 'strict' // Prevents the cookie from being sent in cross-site requests
    }

    res
      .cookie('access_token', accessToken, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 60
      }) // 1 hour
      .cookie('refresh_token', refreshToken, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 60 * 24 * 7
      }) // 7 days
      .status(200)
      .json({
        success: true,
        message: 'Login successful',
        data: user
      })
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    })
  }
})

userRouter.post('/logout', (req, res) => {
  res
    .clearCookie('access_token')
    .clearCookie('refresh_token')
    .status(200)
    .json({
      success: true,
      message: 'Logout successful'
    })
})
