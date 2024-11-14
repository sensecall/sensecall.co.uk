const mongoose = require('mongoose');

const previewRequestSchema = new mongoose.Schema({
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
  screenshot: {
    image: String, // base64 encoded desktop screenshot
    timestamp: Date
  },
  previewReport: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  fullReportRequested: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('PreviewRequest', previewRequestSchema); 