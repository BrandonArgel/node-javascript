import { verifyAccessToken } from '#utils/jwt.js'
import { logger } from '#config/logger.js'

export const requireAuth = (req, res, next) => {
  const token = req.cookies.access_token

  if (!token) {
    logger.warn('Attempt to access protected route without token')
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Login required.'
    })
  }

  try {
    // Verify that the token is valid and not expired.
    const decodedPayload = verifyAccessToken(token)

    req.user = decodedPayload

    next()
  } catch (error) {
    logger.error({ err: error.message }, 'Invalid or expired token')
    return res
      .status(401)
      .json({ success: false, message: 'Session expired or invalid' })
  }
}
