const jwt = require('jsonwebtoken')
const User = require('../models/user/User')
const { CustomError } = require('./errorHandler')

const requireAuth = async (req, res, next) => {
  try {
    // Check for Authorization header
    const { authorization } = req.headers
  
    if (!authorization || !authorization.startsWith('Bearer ')) {
      console.log('Missing or invalid Authorization header format')
      throw new CustomError('Request is not authorized', 401)
    }
  
    // Extract token from header
    const accessToken = authorization.split(' ')[1]
    if (!accessToken) {
      console.log('No token found in Authorization header')
      throw new CustomError('Request is not authorized', 401)
    }

    let decoded
    try {
      // Verify the token
      decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    } catch (jwtError) {
      console.error('JWT Verification error:', jwtError.name, jwtError.message)
      
      if (jwtError instanceof jwt.TokenExpiredError) {
        throw new CustomError('Forbidden token expired', 403)
      } else if (jwtError instanceof jwt.JsonWebTokenError) {
        throw new CustomError('Invalid token', 403)
      } else {
        throw new CustomError('Token verification failed', 403)
      }
    }

    // Validate token contents
    if (!decoded || !decoded.userInfo || !decoded.userInfo._id) {
      console.error('Token missing required user info')
      throw new CustomError('Invalid token content', 401)
    }

    // Find user in database
    const user = await User.findOne({ _id: decoded.userInfo._id })
      .select('_id active roles name')
      .lean()
      .exec()
    
    if (!user) {
      console.error('User not found in database with ID:', decoded.userInfo._id)
      throw new CustomError('Unauthorized user not found', 401)
    }

    if (!user.active) {
      console.log('User account blocked:', user._id)
      res.clearCookie('jwt', { httpOnly: true, sameSite: 'Lax', secure: true })
      throw new CustomError('Your account has been blocked', 400)
    }

    // Store user information for route handlers
    req.user = user
    req.roles = user.roles

    console.log('User authenticated successfully:', {
      userId: req.user._id,
      roles: req.roles,
      name: req.user.name
    })

    next()
  } catch (error) {
    console.error('Authentication error:', error.message)
    next(error)
  }
}

module.exports = requireAuth