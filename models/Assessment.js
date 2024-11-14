const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  sessionId: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  websiteUrl: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  validationResults: {
    urlValid: Boolean,
    dnsValid: Boolean,
    siteResponds: Boolean,
    timestamp: Date
  },
  screenshots: [{
    breakpoint: {
      width: Number,
      height: Number
    },
    image: String,
    timestamp: Date
  }],
  error: String,
  created: Date,
  completed: Date
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
