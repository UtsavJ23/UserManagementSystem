const mongoose = require('mongoose')

const sleepSchema = new mongoose.Schema({
  sleep: {
    type: String,
    required: true
  },
  wake: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  user_id: {
    type: String,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Sleep', sleepSchema)