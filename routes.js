const express = require('express');
const router = express.Router();
const { captureScreenshots } = require('./captureScreenshot');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Home page
router.get('/', (req, res) => {
    res.render('pages/index.njk', {
        title: 'Home',
        description: 'Your Digital Presence Probably Needs a Little Work'
    });
});

// Pricing page
router.get('/pricing', (req, res) => {
    res.render('pages/pricing.njk', {
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

// Projects page
router.get('/assessment', async (req, res) => {
    const websiteUrl = req.query.url || null;
    const sessionId = crypto.randomBytes(16).toString('hex');
    
    console.log('Assessment page loaded:', {
        websiteUrl,
        sessionId,
        hasUrl: !!websiteUrl
    });
    
    if (websiteUrl) {
        captureScreenshotsAsync(websiteUrl, sessionId);
    }

    res.render('pages/assessment.njk', {
        title: 'Assessment',
        description: 'Get a brutally honest assessment of your digital presence.',
        websiteUrl,
        sessionId
    });
});

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
    console.log(`🔄 Starting async screenshot capture for session ${sessionId}`);
    const screenshotsPath = path.join(__dirname, 'tmp', sessionId);
    
    try {
        console.log(`📁 Creating directory: ${screenshotsPath}`);
        await fs.mkdir(screenshotsPath, { recursive: true });
        
        console.log('📸 Capturing screenshots...');
        const screenshots = await captureScreenshots(url);
        
        console.log('💾 Saving screenshots to disk...');
        await Promise.all(screenshots.map(async (screenshot) => {
            const filename = `${screenshot.breakpoint.width}x${screenshot.breakpoint.height}.jpg`;
            const filepath = path.join(screenshotsPath, filename);
            console.log(`📝 Writing file: ${filepath}`);
            await fs.writeFile(filepath, screenshot.image, 'base64');
        }));

        console.log('✅ Screenshot capture and save complete');
    } catch (error) {
        console.error('❌ Error in captureScreenshotsAsync:', error);
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

module.exports = router;