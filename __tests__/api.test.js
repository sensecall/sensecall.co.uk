// __tests__/api.test.js
const request = require('supertest');
const express = require('express');
const app = express();

// Import routes
const router = require('../routes');
app.use(express.json());
app.use('/', router);

// Mock needs to be at the top level, outside of any describe/test blocks
jest.mock('../models/Assessment', () => ({
    findOne: jest.fn().mockResolvedValue(null)
}));

describe('API Validation Status', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    test('GET /api/validation-status/:sessionId should handle invalid session', async () => {
        const response = await request(app)
            .get('/api/validation-status/invalid-session');
        
        expect(response.status).toBe(404);
    });
});