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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ReportRequest', reportRequestSchema);