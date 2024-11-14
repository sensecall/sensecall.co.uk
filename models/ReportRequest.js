const mongoose = require('mongoose');

const reportRequestSchema = new mongoose.Schema({
  websiteUrl: {
    type: String,
    required: true,
    trim: true
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
  screenshots: [{
    breakpoint: {
      width: Number,
      height: Number
    },
    path: String
  }],
  previewReport: {
    type: String
  },
  lighthouseReport: {
    scores: {
      performance: Number,
      accessibility: Number,
      bestPractices: Number,
      seo: Number
    },
    rawReport: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ReportRequest', reportRequestSchema);