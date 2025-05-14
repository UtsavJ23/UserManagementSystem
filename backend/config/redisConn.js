const redis = require('redis')

// Use only REDIS_URL if available, and ignore password if set to 'none', 'null', or 'unused'
const redisOptions = {}

if (process.env.REDIS_URL) {
    redisOptions.url = process.env.REDIS_URL
}

if (
    process.env.REDIS_PASSWORD &&
    !['none', 'null', 'unused'].includes(process.env.REDIS_PASSWORD)
) {
    redisOptions.password = process.env.REDIS_PASSWORD
}

const client = redis.createClient(redisOptions)

client.on('error', (err) => {
    console.error('Redis error: ', err)
})

client.on('ready', () => {
    console.log('Connected to Redis')
})

client.connect()

module.exports = client
