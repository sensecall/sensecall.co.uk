const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  websiteUrl: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  created: {
    type: Date,
    default: Date.now
  },
  completed: {
    type: Date
  },
  error: {
    type: String
  }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
