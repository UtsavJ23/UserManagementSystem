const url = require('./url')
const allowedOrigins = [
  url,
  'https://scaleupaxis.live',
  'https://www.scaleupaxis.live',
  'https://saksham-user-project.netlify.app',
  process.env.CLIENT_URL
]
const paths = ['/api/auth/google', '/api/auth/google/callback']

module.exports = { allowedOrigins, paths }