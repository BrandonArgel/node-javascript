// src/utils/jwt.js
import jwt from 'jsonwebtoken'
import { JWT_SECRET, JWT_REFRESH_SECRET } from '#config/env.js'

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })
}

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}
export const verifyRefreshToken = (token) =>
  jwt.verify(token, JWT_REFRESH_SECRET)
