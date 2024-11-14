const express = require('express');
const router = express.Router();
const Assessment = require('../../models/Assessment');
const { captureScreenshots } = require('../../services/captureScreenshot');
const crypto = require('crypto');
const { validateUrl } = require('../../services/urlValidationService');

// Handle form submission
router.post('/submit-assessment', async (req, res) => {
  try {
    console.log('📝 Received assessment submission request');
    const sessionId = crypto.randomBytes(16).toString('hex');
    console.log(`🔑 Generated session ID: ${sessionId}`);
    const {
      url,
      name,
      email,
      phone,
      'company-name': companyName,
      message
    } = req.body;

    console.log(`🌐 Submitting assessment for URL: ${url}`);

    // Create initial assessment record
    const assessment = new Assessment({
      websiteUrl: url,
      sessionId,
      name,
      email,
      phone,
      companyName,
      message,
      status: 'pending',
      created: new Date()
    });

    await assessment.save();
    console.log(`💾 Assessment saved to database with ID: ${assessment._id}`);

    // Start screenshot capture process
    captureScreenshots(url)
      .then(async (screenshots) => {
        console.log(`📸 Screenshots captured successfully for session ${sessionId}:`, screenshots.length);
        // Update assessment with screenshots and status
        await Assessment.findOneAndUpdate(
          { sessionId },
          { 
            screenshots,
            status: 'completed',
            completed: new Date()
          }
        );
        console.log(`✅ Assessment updated with screenshots for session ${sessionId}`);
      })
      .catch(async (error) => {
        console.error(`❌ Screenshot capture failed for session ${sessionId}:`, error);
        await Assessment.findOneAndUpdate(
          { sessionId },
          { 
            status: 'failed',
            error: error.message
          }
        );
        console.log(`❗ Assessment marked as failed for session ${sessionId}`);
      });

    // Return success response with sessionId
    console.log(`🚀 Sending success response for session ${sessionId}`);
    res.json({
      success: true,
      sessionId,
      message: 'Assessment submitted successfully'
    });

  } catch (error) {
    console.error('❌ Assessment submission failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit assessment',
      error: error.message
    });
  }
});

// Get assessment status
router.get('/status/:sessionId', async (req, res) => {
  try {
    console.log(`🔍 Fetching status for session ${req.params.sessionId}`);
    const assessment = await Assessment.findOne({ 
      sessionId: req.params.sessionId 
    });
    
    if (!assessment) {
      console.log(`❓ Assessment not found for session ${req.params.sessionId}`);
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    console.log(`📊 Returning status for session ${req.params.sessionId}: ${assessment.status}`);
    res.json({
      success: true,
      status: assessment.status,
      screenshots: assessment.screenshots
    });

  } catch (error) {
    console.error(`❌ Error fetching status for session ${req.params.sessionId}:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment status'
    });
  }
});

// Get screenshot status
router.get('/screenshot-status/:sessionId', async (req, res) => {
    try {
        console.log(`🖼️ Fetching screenshot status for session ${req.params.sessionId}`);
        const assessment = await Assessment.findOne({ 
            sessionId: req.params.sessionId 
        });

        if (!assessment) {
            console.log(`❓ Assessment not found for session ${req.params.sessionId}`);
            return res.status(404).json({ 
                error: 'Assessment not found' 
            });
        }

        // Check if screenshots exist and are in the expected format
        const screenshots = assessment.screenshots || [];
        const status = screenshots.length === 3 ? 'complete' : 'processing';
        console.log(`📸 Screenshot status for session ${req.params.sessionId}: ${status}`);

        res.json({
            status,
            screenshots: screenshots.map(screenshot => ({
                image: screenshot.image,
                breakpoint: screenshot.breakpoint,
                timestamp: screenshot.timestamp
            })),
            message: `Status: ${status}`
        });
    } catch (error) {
        console.error(`❌ Error fetching screenshot status for session ${req.params.sessionId}:`, error);
        res.status(500).json({ 
            error: 'Failed to fetch status' 
        });
    }
});

// Add new endpoint for validation status
router.get('/validation-status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const assessment = await Assessment.findOne({ sessionId });
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const status = {
      urlValidation: assessment.validationResults?.urlValid || false,
      dnsCheck: assessment.validationResults?.dnsValid || false,
      siteResponse: assessment.validationResults?.siteResponds || false,
      screenshots: assessment.screenshots?.length > 0 || false,
      status: assessment.status,
      error: assessment.error
    };

    res.json(status);
  } catch (error) {
    console.error('Error checking validation status:', error);
    res.status(500).json({ error: 'Failed to check validation status' });
  }
});

module.exports = router; 