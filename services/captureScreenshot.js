const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const tmpDir = path.join(__dirname, '../tmp');

require('dotenv').config();
const env = process.env.NODE_ENV;

// Add environment check at the top
const isDevelopment = env === 'development';

// Add stealth plugin
puppeteer.use(StealthPlugin());

// Export the screenshot capture functionality
const captureScreenshots = async (url, breakpointTypes = ['desktop']) => {
    console.log(`🔄 Starting screenshot capture for URL: ${url}`);
    
    const browserOptions = {
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    };

    const breakpoints = {
        mobile: { width: 320, height: 568 },
        tablet: { width: 768, height: 1024 },
        desktop: { width: 1366, height: 768 }
    };

    const selectedBreakpoints = breakpointTypes.map(type => breakpoints[type]);
    
    let browser = null;
    let screenshots = [];
    
    try {
        console.log('🌐 Launching browser...');
        browser = await puppeteer.launch(browserOptions);
        
        console.log('📸 Capturing screenshots for breakpoints:', selectedBreakpoints);
        for (const breakpoint of selectedBreakpoints) {
            console.log(`⚡ Processing breakpoint: ${breakpoint.width}x${breakpoint.height}`);
            const page = await browser.newPage();
            
            try {
                await page.setViewport({
                    ...breakpoint,
                    deviceScaleFactor: 1,
                    isMobile: breakpoint.width < 768
                });

                console.log(`📄 Navigating to ${url} for ${breakpoint.width}x${breakpoint.height}`);
                await page.goto(url, {
                    waitUntil: ['networkidle0', 'domcontentloaded'],
                    timeout: 30000
                });

                await page.evaluate(() => {
                    return new Promise((resolve) => {
                        window.scrollTo(0, document.body.scrollHeight);
                        setTimeout(resolve, 2000);
                    });
                });

                await page.evaluate(() => {
                    window.scrollTo(0, 0);
                });

                console.log(`⏳ Waiting for content to settle at ${breakpoint.width}x${breakpoint.height}`);
                await new Promise(resolve => setTimeout(resolve, 2000));

                console.log(`📸 Taking screenshot for ${breakpoint.width}x${breakpoint.height}`);
                const screenshotBuffer = await page.screenshot({
                    type: 'jpeg',
                    quality: 85,
                    fullPage: true,
                    encoding: 'base64'
                });

                console.log(`✅ Screenshot captured for ${breakpoint.width}x${breakpoint.height}`);
                const screenshot = {
                    breakpoint,
                    image: screenshotBuffer,
                    timestamp: new Date().toISOString()
                };
                screenshots.push(screenshot);
            } catch (error) {
                console.error(`❌ Error capturing screenshot for ${breakpoint.width}x${breakpoint.height}:`, error);
                throw error;
            } finally {
                await page.close();
            }
        }

        console.log('✅ All screenshots captured successfully');
        return screenshots;
    } catch (error) {
        console.error('❌ Screenshot capture failed:', error);
        throw error;
    } finally {
        if (browser) {
            console.log('🔄 Closing browser');
            await browser.close();
            console.log('✅ Browser closed successfully');
            console.log('📊 Final screenshots count:', screenshots.length);
        }
    }
};

// Create routes for the screenshot functionality
router.post('/', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        const screenshots = await captureScreenshots(url);
        
        res.json({ 
            success: true,
            message: 'Screenshots captured successfully',
            count: screenshots.length,
            screenshots 
        });
    } catch (error) {
        console.error('Screenshot capture failed:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to capture screenshots',
            message: error.message 
        });
    }
});

module.exports = {
    router,
    captureScreenshots
};