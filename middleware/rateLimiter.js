// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const isDevelopment = process.env.NODE_ENV === 'development';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 5, // Higher limit in development
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
  handler: (req, res) => {
    // Set flag to skip validation
    req.skipValidation = true;
    // Ensure body object exists
    req.body = req.body || {};
    const queryParams = new URLSearchParams({
      error: 'rate_limit',
      email: req.body.email || '',
      url: req.body.url || ''
    });
    res.redirect(`/?${queryParams.toString()}`);
  }
});

// Export the configured limiter and the max value for testing
module.exports = Object.assign(limiter, { max: isDevelopment ? 1000 : 5 });