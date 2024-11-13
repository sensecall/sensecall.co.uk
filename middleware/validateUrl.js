// middleware/validateUrl.js
const validateUrl = (req, res, next) => {
    const { url } = req.body;
    try {
      new URL(url);
      next();
    } catch (error) {
      res.status(400).json({ error: 'Invalid URL format' });
    }
  };
  
  module.exports = validateUrl;