import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken
} from '#utils/jwt.js'

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
}

export const checkAuth = (req, res, next) => {
  const accessToken = req.cookies.access_token
  const refreshToken = req.cookies.refresh_token

  if (!accessToken && !refreshToken) {
    return next()
  }

  try {
    if (accessToken) {
      const decoded = verifyAccessToken(accessToken)
      res.locals.user = decoded
      return next()
    }
  } catch (error) {
    // Invalid or expired Access Token: try to use the Refresh Token
    logger.warn(
      { err: error.message },
      'Access token invalid or expired, attempting to use refresh token'
    )
  }

  if (refreshToken) {
    try {
      const decodedRefresh = verifyRefreshToken(refreshToken)

      const newPayload = {
        id: decodedRefresh.id,
        username: decodedRefresh.username
      }
      const newAccessToken = generateAccessToken(newPayload)

      res.cookie('access_token', newAccessToken, {
        ...cookieOptions,
        maxAge: 1000 * 60 * 60
      })

      res.locals.user = newPayload
      return next()
    } catch (error) {
      res.clearCookie('access_token')
      res.clearCookie('refresh_token')
      return next()
    }
  }

  next()
}
