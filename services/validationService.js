// services/validationService.js
const { validateUrl, ValidationError } = require('./urlValidationService');
const { captureScreenshots } = require('./captureScreenshot');
const Assessment = require('../models/Assessment');

async function validateWebsite(url, sessionId) {
    console.log(`🔄 Starting validation for ${url} (session id: ${sessionId})`);
    
    try {
        // Update the assessment status to processing
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
        const validationResult = await validateUrl(url);
        console.log('📊 URL validation result:', validationResult);
        
        if (!validationResult.valid) {
            console.error(`❌ URL validation failed: ${validationResult.error}`);
            await Assessment.findOneAndUpdate(
                { sessionId },
                { 
                    status: 'failed',
                    error: validationResult.message,
                    validationResults: {
                        urlValid: false,
                        dnsValid: false,
                        siteResponds: false,
                        error: validationResult.error,
                        message: validationResult.message,
                        timestamp: new Date()
                    }
                }
            );
            return false;
        }

        const updateResult = await Assessment.findOneAndUpdate(
            { sessionId },
            { 
                validationResults: {
                    urlValid: true,
                    dnsValid: true,
                    siteResponds: true,
                    status: validationResult.status,
                    contentType: validationResult.contentType,
                    timestamp: new Date()
                }
            }
        );
        console.log('✅ URL validation successful, validation results updated in database');

        // Capture screenshots
        try {
            const screenshots = await captureScreenshots(url);
            
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
                    error: `Screenshot capture failed: ${error.message}`,
                    validationResults: {
                        ...updateResult.validationResults,
                        error: ValidationError.SCREENSHOT_FAILED,
                        message: `Screenshot capture failed: ${error.message}`,
                        timestamp: new Date()
                    }
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
                error: `Validation process failed: ${error.message}`,
                validationResults: {
                    urlValid: false,
                    dnsValid: false,
                    siteResponds: false,
                    error: ValidationError.UNKNOWN_ERROR,
                    message: `Validation process failed: ${error.message}`,
                    timestamp: new Date()
                }
            }
        );
        return false;
    }
}

module.exports = { validateWebsite };