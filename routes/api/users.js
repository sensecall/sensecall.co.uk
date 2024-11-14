const express = require('express');
const router = express.Router();
const User = require('../../models/User');

router.post('/register-interest', async (req, res) => {
  try {
    const { email, url } = req.body;
    
    // Create new user
    const user = new User({
      email,
      websiteUrl: url,
      status: 'pending'
    });

    await user.save();

    // Redirect to assessment page with the URL
    res.redirect(`/assessment?url=${encodeURIComponent(url)}`);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).redirect('/?error=registration-failed');
  }
});

module.exports = router; 