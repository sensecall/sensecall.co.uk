const { validateWebsite } = require('../services/validationService');
const { validateUrl } = require('../services/urlValidationService');
const { captureScreenshots } = require('../services/captureScreenshot');
const Assessment = require('../models/Assessment');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock the dependencies
jest.mock('../services/urlValidationService');
jest.mock('../services/captureScreenshot');
jest.mock('../models/Assessment');

describe('validateWebsite', () => {
    let mongoServer;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        Assessment.findOneAndUpdate.mockReset();
    });

    test('should handle successful validation and screenshot capture', async () => {
        // Mock successful responses
        validateUrl.mockResolvedValue({
            valid: true,
            status: 200,
            contentType: 'text/html'
        });
        
        captureScreenshots.mockResolvedValue([{
            breakpoint: { width: 1920, height: 1080 },
            image: 'base64string'
        }]);

        Assessment.findOneAndUpdate.mockResolvedValue({
            validationResults: {
                urlValid: true,
                dnsValid: true,
                siteResponds: true
            }
        });

        const result = await validateWebsite('https://example.com', 'test-session-id');

        expect(result).toBe(true);
        expect(Assessment.findOneAndUpdate).toHaveBeenCalledTimes(3);
        
        // Verify the correct status updates were made
        expect(Assessment.findOneAndUpdate.mock.calls[0][1]).toHaveProperty('status', 'processing');
        expect(Assessment.findOneAndUpdate.mock.calls[2][1]).toHaveProperty('status', 'completed');
    });

    test('should handle URL validation failure', async () => {
        validateUrl.mockResolvedValue({
            valid: false,
            error: 'INVALID_URL',
            message: 'Invalid URL format'
        });

        const result = await validateWebsite('invalid-url', 'test-session-id');

        expect(result).toBe(false);
        expect(Assessment.findOneAndUpdate).toHaveBeenCalledTimes(2);
        
        // Verify failure status was set
        const updateCall = Assessment.findOneAndUpdate.mock.calls[1][1];
        expect(updateCall).toHaveProperty('status', 'failed');
        expect(updateCall.validationResults).toHaveProperty('urlValid', false);
    });

    test('should handle screenshot capture failure', async () => {
        // Mock successful URL validation
        validateUrl.mockResolvedValue({
            valid: true,
            status: 200,
            contentType: 'text/html'
        });

        // Mock successful database updates
        Assessment.findOneAndUpdate.mockImplementation((query, update) => {
            return Promise.resolve({
                validationResults: {
                    urlValid: true,
                    dnsValid: true,
                    siteResponds: true,
                    contentType: 'text/html'
                }
            });
        });

        // Mock screenshot capture failure
        captureScreenshots.mockRejectedValue(new Error('Screenshot capture failed'));

        const result = await validateWebsite('https://example.com', 'test-session-id');

        expect(result).toBe(false);
        expect(Assessment.findOneAndUpdate).toHaveBeenCalledTimes(3);
        
        // Verify failure status was set
        const updateCall = Assessment.findOneAndUpdate.mock.calls[2][1];
        expect(updateCall).toHaveProperty('status', 'failed');
        expect(updateCall.error).toContain('Screenshot capture failed');
        expect(updateCall.validationResults.error).toBe('SCREENSHOT_FAILED');
    });

    test('should handle unexpected errors', async () => {
        // Mock database update for initial status
        Assessment.findOneAndUpdate.mockImplementation((query, update) => {
            return Promise.resolve({
                validationResults: {
                    urlValid: false,
                    dnsValid: false,
                    siteResponds: false
                }
            });
        });

        // Mock validation failure
        validateUrl.mockRejectedValue(new Error('Unexpected error'));

        const result = await validateWebsite('https://example.com', 'test-session-id');

        expect(result).toBe(false);
        expect(Assessment.findOneAndUpdate).toHaveBeenCalledTimes(2);
        
        // Verify error status was set
        const updateCall = Assessment.findOneAndUpdate.mock.calls[1][1];
        expect(updateCall).toHaveProperty('status', 'failed');
        expect(updateCall.error).toContain('Validation process failed');
        expect(updateCall.validationResults.error).toBe('UNKNOWN_ERROR');
    });

    test('should update database with correct validation results', async () => {
        validateUrl.mockResolvedValue({
            valid: true,
            status: 200,
            contentType: 'text/html'
        });
        
        captureScreenshots.mockResolvedValue([{
            breakpoint: { width: 1920, height: 1080 },
            image: 'base64string'
        }]);

        await validateWebsite('https://example.com', 'test-session-id');

        // Verify validation results were updated correctly
        const validationUpdate = Assessment.findOneAndUpdate.mock.calls[1][1];
        expect(validationUpdate.validationResults).toMatchObject({
            urlValid: true,
            dnsValid: true,
            siteResponds: true,
            contentType: 'text/html'
        });
    });
}); 