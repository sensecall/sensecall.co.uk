const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  websiteUrl: {
    type: String,
    required: true  // Making this required
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    required: true
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
