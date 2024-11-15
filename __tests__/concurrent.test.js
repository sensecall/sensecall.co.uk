const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const Assessment = require('../models/Assessment');

let mongoServer;
const app = express();

// Import routes and middleware
const router = require('../routes');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', router);

describe('Concurrent Request Handling', () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await User.deleteMany({});
        await Assessment.deleteMany({});
    });

    test('should handle concurrent requests for same email/url correctly', async () => {
        const testData = {
            email: 'test@example.com',
            url: 'https://example.com'
        };

        // Send 5 concurrent requests
        const requests = Array(5).fill().map(() => 
            request(app)
                .post('/register-interest')
                .send(testData)
        );

        const responses = await Promise.all(requests);

        // All responses should be redirects
        responses.forEach(response => {
            expect(response.status).toBe(302);
        });

        // Should only create one user
        const users = await User.find({ email: testData.email });
        expect(users).toHaveLength(1);

        // Should only create one assessment within the time window
        const assessments = await Assessment.find({
            userId: users[0]._id,
            websiteUrl: testData.url,
            created: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        expect(assessments).toHaveLength(1);
    });

    test('should handle rate limiting for concurrent requests correctly', async () => {
        const email = 'test@example.com';
        const urls = [
            'https://site1.com',
            'https://site2.com',
            'https://site3.com',
            'https://site4.com',
            'https://site5.com'
        ];

        // Send concurrent requests for different URLs
        const requests = urls.map(url => 
            request(app)
                .post('/register-interest')
                .send({ email, url })
        );

        const responses = await Promise.all(requests);

        // Count successful and rate-limited responses
        const successfulResponses = responses.filter(r => 
            !r.headers.location.includes('error=rate_limit')
        );

        // Should only allow 3 successful requests
        expect(successfulResponses).toHaveLength(3);

        // Verify assessments in database
        const user = await User.findOne({ email });
        const assessments = await Assessment.find({ userId: user._id });
        expect(assessments).toHaveLength(3);
    });
}); 