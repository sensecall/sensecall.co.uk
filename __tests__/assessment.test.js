const Assessment = require('../models/Assessment');

describe('Assessment Model', () => {
    // Basic validation test
    test('should validate required fields', () => {
        const assessment = new Assessment({});
        const validationError = assessment.validateSync();
        
        expect(validationError).toBeDefined();
        expect(validationError.errors.websiteUrl).toBeDefined();
        expect(validationError.errors.sessionId).toBeDefined();
    });

    // Test valid assessment creation
    test('should create valid assessment', async () => {
        const assessment = new Assessment({
            sessionId: 'test-session-123',
            websiteUrl: 'https://example.com',
            status: 'pending',
            compound_key: 'test-session-123-example.com'
        });

        const validationError = assessment.validateSync();
        expect(validationError).toBeUndefined();
    });

    // Additional test for invalid status
    test('should validate status enum values', () => {
        const assessment = new Assessment({
            sessionId: 'test-session-123',
            websiteUrl: 'https://example.com',
            status: 'invalid-status'
        });

        const validationError = assessment.validateSync();
        expect(validationError).toBeDefined();
        expect(validationError.errors.status).toBeDefined();
    });
});
