const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const Assessment = require('./models/Assessment');
const { captureScreenshots } = require('./services/captureScreenshot');
const { validateUrl } = require('./services/urlValidationService');
const assessmentRouter = require('./routes/assessment');
const ReportRequest = require('./models/ReportRequest');
const { validateWebsite } = require('./services/validationService');
const User = require('./models/User');

// Home page
router.get('/', (req, res) => {
    res.render('pages/landing.njk', {
        title: 'Home',
        description: 'Your Digital Presence Probably Needs a Little Work'
    });
});

// Landing page
router.get('/home', (req, res) => {
    res.render('pages/index.njk', {
        title: 'Landing',
        description: 'Get a Free Website Audit Report'
    });
});

// Pricing page
router.get('/pricing', (req, res) => {
    res.render('pages/pricing-simple.njk', {
        title: 'Pricing',
        description: 'Our pricing plans'
    });
});

// Sign in page
router.get('/signin', (req, res) => {
    res.render('pages/signin.njk', {
        title: 'Sign in to your SiteHero account'
    });
});

// Assessment route
router.use('/assessment', assessmentRouter);

// New endpoint to check screenshot status
router.get('/api/screenshot-status/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const screenshotsPath = path.join(__dirname, 'tmp', sessionId);
    
    try {
        console.log(`🔍 Checking screenshot status for session ${sessionId}`);
        const files = await fs.readdir(screenshotsPath);
        
        if (files.length === 0) {
            console.log('⏳ No screenshots found yet - still processing');
            return res.json({ status: 'processing' });
        }

        console.log(`📂 Found ${files.length} screenshots, loading...`);
        const screenshots = await Promise.all(files.map(async (file) => {
            const data = await fs.readFile(path.join(screenshotsPath, file), 'base64');
            const [width, height] = file.split('.')[0].split('x');
            return {
                breakpoint: { width: parseInt(width), height: parseInt(height) },
                image: data
            };
        }));
        
        console.log('✅ Screenshots loaded successfully');
        res.json({ status: 'complete', screenshots });
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('⏳ Directory not found - still processing');
            res.json({ status: 'processing' });
        } else {
            console.error('❌ Error checking screenshot status:', error);
            res.status(500).json({ error: 'Failed to check screenshot status' });
        }
    }
});

// Function to handle screenshot capture asynchronously
async function captureScreenshotsAsync(url, sessionId) {
    try {
        const tmpDir = path.join(__dirname, 'tmp');
        const screenshotsPath = path.join(tmpDir, sessionId);
        
        // Ensure directories exist
        await fs.mkdir(tmpDir, { recursive: true });
        await fs.mkdir(screenshotsPath, { recursive: true });
        
        // Capture screenshots
        const screenshots = await captureScreenshots(url);
        
        // Save screenshots to disk first
        for (const screenshot of screenshots) {
            const filename = `${screenshot.breakpoint.width}x${screenshot.breakpoint.height}.jpg`;
            const filepath = path.join(screenshotsPath, filename);
            await fs.writeFile(filepath, Buffer.from(screenshot.image, 'base64'));
        }
        
        // Then update assessment with screenshots and completed status
        await Assessment.findOneAndUpdate(
            { sessionId },
            { 
                screenshots,
                status: 'completed',
                completed: new Date()
            }
        );
        
        return screenshots;
    } catch (error) {
        console.error('Screenshot capture failed:', error);
        await Assessment.findOneAndUpdate(
            { sessionId },
            { 
                status: 'failed',
                error: error.message
            }
        );
        throw error;
    }
}

// Handle form submission
router.post('/assessment/submit', (req, res) => {
    // Handle form submission and redirect to thank you page
    res.redirect('/assessment/thank-you');
});

// Services page
router.get('/services', (req, res) => {
    res.render('pages/services.njk', {
        title: 'Services',
        description: 'We offer a range of services to help you improve your digital presence.'
    });
});

// Screenshot page
router.get('/screenshot', (req, res) => {
    res.render('pages/screenshot.njk', {
        title: 'Screenshot Viewer',
        description: 'Capture and view screenshots of websites.'
    });
});

// Success page
router.get('/success', (req, res) => {
    res.render('pages/success.njk', {
        title: 'Thank You',
        description: 'Your website analysis is being prepared'
    });
});

// Add this debug endpoint
router.get('/api/debug-screenshots/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    const screenshotsPath = path.join(__dirname, 'tmp', sessionId);
    
    try {
        const files = await fs.readdir(screenshotsPath);
        res.json({
            sessionId,
            path: screenshotsPath,
            files,
            exists: true
        });
    } catch (error) {
        res.json({
            sessionId,
            path: screenshotsPath,
            error: error.message,
            exists: false
        });
    }
});

router.use('/assessment', assessmentRouter);

router.get('/api/lighthouse-report/:sessionId', async (req, res) => {
  try {
    const report = await ReportRequest.findOne({ sessionId: req.params.sessionId });
    if (!report || !report.lighthouseReport) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report.lighthouseReport);
  } catch (error) {
    console.error('Error fetching Lighthouse report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

router.post('/register-interest', async (req, res) => {
  try {
    const { email, url } = req.body;
    
    // Basic validation
    if (!email || !url) {
      return res.status(400).redirect('/?error=missing_fields');
    }

    let user;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Update existing user's website URL
      existingUser.websiteUrl = url;
      user = await existingUser.save();
    } else {
      // Create new user
      user = new User({
        email,
        websiteUrl: url,
        createdAt: new Date()
      });
      await user.save();
    }

    // Generate session ID for tracking
    const sessionId = crypto.randomBytes(16).toString('hex');

    // Create initial assessment
    const assessment = new Assessment({
      websiteUrl: url,
      sessionId,
      userId: user._id,
      status: 'pending',
      created: new Date()
    });

    await assessment.save();

    // Redirect to processing page with session ID
    res.redirect(`/processing/${sessionId}`);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).redirect('/?error=server_error');
  }
});

// Add after the register-interest route
router.get('/processing/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    console.log(`🔍 Processing request for session: ${sessionId}`);
    
    try {
        const assessment = await Assessment.findOne({ sessionId });
        if (!assessment) {
            console.log(`❌ No assessment found for session: ${sessionId}`);
            return res.redirect('/?error=invalid_session');
        }

        // Render the processing page
        res.render('pages/processing.njk', {
            title: 'Analysing Your Website',
            websiteUrl: assessment.websiteUrl,
            sessionId
        });

        // Start validation if not already done
        if (assessment.status === 'pending') {
            validateWebsite(assessment.websiteUrl, sessionId)
                .catch(error => {
                    console.error('Validation failed:', error);
                });
        }

    } catch (error) {
        console.error(`❌ Processing page error for session ${sessionId}:`, error);
        res.redirect('/?error=server_error');
    }
});

// Add this route to handle validation status checks
router.get('/api/validation-status/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const assessment = await Assessment.findOne({ sessionId });
        
        if (!assessment) {
            return res.status(404).json({
                error: 'Assessment not found'
            });
        }

        res.json({
            status: assessment.status,
            validationResults: assessment.validationResults,
            screenshots: assessment.screenshots,
            error: assessment.error
        });
    } catch (error) {
        console.error('Error fetching validation status:', error);
        res.status(500).json({
            error: 'Failed to fetch validation status'
        });
    }
});

module.exports = router;