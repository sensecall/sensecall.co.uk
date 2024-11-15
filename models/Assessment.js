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
    required: true
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
  created: {
    type: Date,
    default: Date.now
  },
  completed: Date,
  compound_key: {
    type: String,
    unique: true
  }
});

// Add pre-save middleware to generate compound_key
AssessmentSchema.pre('save', function(next) {
  if (!this.compound_key) {
    const sanitizedUrl = this.websiteUrl.replace(/[^a-zA-Z0-9]/g, '');
    this.compound_key = `${this.sessionId}_${sanitizedUrl}_${this.created.toISOString().split('T')[0]}`;
  }
  next();
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
