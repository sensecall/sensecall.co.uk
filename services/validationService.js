// services/validationService.js
const { validateUrl } = require('./urlValidationService');
const { captureScreenshots } = require('./captureScreenshot');
const Assessment = require('../models/Assessment');

async function validateWebsite(url, sessionId) {
    console.log(`🔄 Starting validation process for session: ${sessionId}`);
    console.log(`📝 URL to validate: ${url}`);
    
    try {
        console.log('⏳ Updating status to processing...');
        await Assessment.findOneAndUpdate(
            { sessionId },
            { 
                status: 'processing',
                validationResults: {
                    urlValid: false,
                    dnsValid: false,
                    siteResponds: false,
                    timestamp: new Date()
                }
            }
        );
        console.log('✅ Status updated to processing');

        // Validate URL and site
        console.log('🔍 Starting URL validation...');
        const validationResult = await validateUrl(url);
        console.log('📊 URL validation result:', validationResult);
        
        if (!validationResult.valid) {
            console.error(`❌ URL validation failed: ${validationResult.error}`);
            await Assessment.findOneAndUpdate(
                { sessionId },
                { 
                    status: 'failed',
                    error: validationResult.error,
                    validationResults: {
                        urlValid: false,
                        dnsValid: false,
                        siteResponds: false,
                        error: validationResult.error,
                        timestamp: new Date()
                    }
                }
            );
            return false;
        }

        console.log('✅ URL validation successful, updating results...');
        const updateResult = await Assessment.findOneAndUpdate(
            { sessionId },
            { 
                validationResults: {
                    urlValid: true,
                    dnsValid: true,
                    siteResponds: true,
                    timestamp: new Date()
                }
            }
        );
        console.log('✅ Validation results updated in database');

        // Capture screenshots
        try {
            console.log('Starting screenshot capture...');
            const screenshots = await captureScreenshots(url);
            console.log(`Successfully captured ${screenshots.length} screenshots`);
            
            // Update with completed status
            await Assessment.findOneAndUpdate(
                { sessionId },
                { 
                    screenshots,
                    status: 'completed',
                    completed: new Date()
                }
            );

            return true;
        } catch (error) {
            console.error('Screenshot capture failed:', error);
            await Assessment.findOneAndUpdate(
                { sessionId },
                { 
                    status: 'failed',
                    error: `Screenshot capture failed: ${error.message}`
                }
            );
            return false;
        }
    } catch (error) {
        console.error('Validation failed:', error);
        await Assessment.findOneAndUpdate(
            { sessionId },
            { 
                status: 'failed',
                error: `Validation process failed: ${error.message}`
            }
        );
        return false;
    }
}

module.exports = { validateWebsite };