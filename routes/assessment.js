// routes/assessment.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Assessment = require('../models/Assessment');
const { processWebsiteReport } = require('../services/reportService');
const { captureScreenshots } = require('../services/captureScreenshot');

// Display the assessment form
router.get('/', async (req, res) => {
    const websiteUrl = req.query.url;
    let sessionId = null;
    let screenshots = null;

    if (websiteUrl) {
        try {
            // Generate a session ID for this assessment
            sessionId = crypto.randomBytes(16).toString('hex');
            
            // Create initial assessment record
            const assessment = new Assessment({
                websiteUrl,
                sessionId,
                status: 'processing'
            });
            await assessment.save();

            // Start the screenshot capture process
            captureScreenshots(websiteUrl)
                .then(async (capturedScreenshots) => {
                    await Assessment.findOneAndUpdate(
                        { sessionId },
                        { 
                            screenshots: capturedScreenshots,
                            status: 'completed'
                        }
                    );
                })
                .catch(async (error) => {
                    console.error('Screenshot capture failed:', error);
                    await Assessment.findOneAndUpdate(
                        { sessionId },
                        { status: 'failed' }
                    );
                });
        } catch (error) {
            console.error('Error initializing assessment:', error);
        }
    }

    res.render('pages/assessment.njk', {
        title: 'Website Assessment',
        description: 'Get a free assessment of your website',
        websiteUrl,
        sessionId
    });
});

// Handle form submission
router.post('/submit', async (req, res) => {
    try {
        const sessionId = crypto.randomBytes(16).toString('hex');
        const { url, email, name, phone, message } = req.body;

        // Create assessment record
        const assessment = new Assessment({
            websiteUrl: url,
            sessionId,
            email,
            name,
            phone,
            message,
            status: 'processing'
        });

        await assessment.save();

        // Start processing in background
        processWebsiteReport(url, sessionId).catch(error => {
            console.error('Report processing failed:', error);
        });

        // Redirect to status page
        res.redirect(`/assessment/status/${sessionId}`);

    } catch (error) {
        console.error('Assessment submission failed:', error);
        res.render('pages/assessment.njk', {
            title: 'Website Assessment',
            description: 'Get a free assessment of your website',
            error: 'Failed to submit assessment. Please try again.',
            formData: req.body // Preserve form data
        });
    }
});

// Display status page
router.get('/status/:sessionId', async (req, res) => {
    try {
        const assessment = await Assessment.findOne({ 
            sessionId: req.params.sessionId 
        });

        if (!assessment) {
            return res.redirect('/assessment?error=not_found');
        }

        res.render('pages/assessment-status.njk', {
            title: 'Assessment Status',
            description: 'Track your website assessment progress',
            assessment
        });

    } catch (error) {
        console.error('Failed to fetch assessment:', error);
        res.redirect('/assessment?error=status_failed');
    }
});

module.exports = router;