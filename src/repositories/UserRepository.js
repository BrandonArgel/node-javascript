import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import { User } from '#models/User.js'
import { registerUserSchema } from '#validations/user.schema.js'
import { logger } from '#config/logger.js'
import { SALT_ROUNDS } from '#config/env.js'

export class UserRepository {
  static async create({ email, username, password }) {
    logger.info({ email, username, password }, 'Trying to create an user')

    // 2. Make sure the email is not already taken
    const existingUser = User.findOne({ email })
    if (existingUser) {
      logger.warn({ email }, 'Email is already taken')
      throw new Error('Email is already taken')
    }

    // 3. Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, Number(SALT_ROUNDS))

    // 4. Create the user and save it to the database
    const id = crypto.randomUUID()
    User.create({
      _id: id,
      email,
      username,
      password: hashedPassword
    }).save()

    logger.info({ id, email }, 'User created successfully')

    // Return the user data
    return {
      _id: id,
      email,
      username
    }
  }

  static async login({ email, password }) {
    logger.info({ email, password }, 'Trying to login an user')

    // 2. Find the user by email
    const user = await User.findOne({ email })
    if (!user) {
      logger.warn({ email }, 'User not found with the provided email')
      throw new Error('Invalid email or password')
    }

    // 3. Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      logger.warn({ email }, 'Invalid password provided for the user')
      throw new Error('Invalid email or password')
    }

    logger.info({ email }, 'User logged in successfully')

    const { password: _, ...userData } = user

    // Return the user data
    return userData
  }

  static async logout() {}
}
