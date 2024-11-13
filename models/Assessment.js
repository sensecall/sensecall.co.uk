const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
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
  name: String,
  email: String,
  phone: String,
  companyName: String,
  message: String,
  screenshots: [{
    breakpoint: {
      width: Number,
      height: Number
    },
    image: String // base64 encoded image
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Assessment', assessmentSchema);
