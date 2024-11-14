// routes/assessment.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const PreviewRequest = require('../models/PreviewRequest');
const { generateQuickPreview } = require('../services/previewService');

router.get('/', async (req, res) => {
  const websiteUrl = req.query.url;
  let sessionId = null;

  if (websiteUrl) {
    try {
      console.log('\n🚀 Starting new assessment process');
      sessionId = crypto.randomBytes(16).toString('hex');
      console.log(`📝 Generated session ID: ${sessionId}`);
      console.log(`🌐 Website URL: ${websiteUrl}`);
      
      // Start the quick preview process
      console.log('⏳ Initializing quick preview...');
      generateQuickPreview(websiteUrl, sessionId)
        .catch(error => {
          console.error('❌ Preview generation failed:', error);
        });
      console.log('✅ Preview generation initiated');
    } catch (error) {
      console.error('❌ Error during assessment initialization:', error);
    }
  }

  res.render('pages/assessment.njk', {
    title: 'Website Assessment',
    description: 'Get a quick preview of your website assessment',
    websiteUrl,
    sessionId
  });
});

// Add endpoint to request full report
router.post('/request-full-report', async (req, res) => {
  const { sessionId, email, name } = req.body;

  try {
    const preview = await PreviewRequest.findOne({ sessionId });
    if (!preview) {
      return res.status(404).json({ error: 'Preview not found' });
    }

    // Create full report request
    const reportRequest = new ReportRequest({
      websiteUrl: preview.websiteUrl,
      sessionId: crypto.randomBytes(16).toString('hex'),
      email,
      name,
      status: 'pending'
    });
    await reportRequest.save();

    // Mark preview as having requested full report
    await PreviewRequest.findByIdAndUpdate(preview._id, {
      fullReportRequested: true
    });

    res.json({ 
      success: true, 
      message: 'Full report requested',
      reportSessionId: reportRequest.sessionId 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to request full report' });
  }
});

module.exports = router;