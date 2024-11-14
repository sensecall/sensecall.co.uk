const express = require('express');
const router = express.Router();
const Assessment = require('../../models/Assessment');
const { captureScreenshots } = require('../../services/captureScreenshot');
const crypto = require('crypto');

// Handle form submission
router.post('/submit-assessment', async (req, res) => {
  try {
    const sessionId = crypto.randomBytes(16).toString('hex');
    const {
      url,
      name,
      email,
      phone,
      'company-name': companyName,
      message
    } = req.body;

    // Create initial assessment record
    const assessment = new Assessment({
      websiteUrl: url,
      sessionId,
      name,
      email,
      phone,
      companyName,
      message,
      status: 'processing',
      created: new Date()
    });

    await assessment.save();

    // Start screenshot capture process
    captureScreenshots(url)
      .then(async (screenshots) => {
        console.log(`Screenshots captured successfully for session ${sessionId}:`, screenshots.length);
        // Update assessment with screenshots and status
        await Assessment.findOneAndUpdate(
          { sessionId },
          { 
            screenshots,
            status: 'completed',
            completed: new Date()
          }
        );
      })
      .catch(async (error) => {
        console.error(`Screenshot capture failed for session ${sessionId}:`, error);
        await Assessment.findOneAndUpdate(
          { sessionId },
          { 
            status: 'failed',
            error: error.message
          }
        );
      });

    // Return success response with sessionId
    res.json({
      success: true,
      sessionId,
      message: 'Assessment submitted successfully'
    });

  } catch (error) {
    console.error('Assessment submission failed:', error);
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
    const assessment = await Assessment.findOne({ 
      sessionId: req.params.sessionId 
    });
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      status: assessment.status,
      screenshots: assessment.screenshots
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessment status'
    });
  }
});

// Get screenshot status
router.get('/screenshot-status/:sessionId', async (req, res) => {
    try {
        const assessment = await Assessment.findOne({ 
            sessionId: req.params.sessionId 
        });

        if (!assessment) {
            return res.status(404).json({ 
                error: 'Assessment not found' 
            });
        }

        // Check if screenshots exist and are in the expected format
        const screenshots = assessment.screenshots || [];
        const status = screenshots.length === 3 ? 'complete' : 'processing';

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
        console.error('Error fetching screenshot status:', error);
        res.status(500).json({ 
            error: 'Failed to fetch status' 
        });
    }
});

module.exports = router; 