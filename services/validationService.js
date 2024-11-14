// services/validationService.js
const { validateUrl } = require('./urlValidationService');
const { captureScreenshots } = require('./captureScreenshot');
const Assessment = require('../models/Assessment');

async function validateWebsite(url, sessionId) {
    try {
        // Update status to processing
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

        // Validate URL and site
        const validationResult = await validateUrl(url);
        
        if (!validationResult.valid) {
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

        // Update validation results
        await Assessment.findOneAndUpdate(
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

        // Capture screenshots
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
        console.error('Validation failed:', error);
        await Assessment.findOneAndUpdate(
            { sessionId },
            { 
                status: 'failed',
                error: error.message
            }
        );
        return false;
    }
}

module.exports = { validateWebsite };