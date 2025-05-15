const dev = process.env.NODE_ENV !== 'production'
const url = dev ? process.env.CLIENT_URL : 'https://scaleupaxis.live'

module.exports = url