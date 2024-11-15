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

// Setup express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', router);

describe('Rate Limiting Tests', () => {
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

    test('should enforce rate limits for submissions from same email', async () => {
        const email = 'test@example.com';
        const urls = [
            'https://site1.com',
            'https://site2.com',
            'https://site3.com',
            'https://site4.com'
        ];

        // First three submissions should succeed
        for (let i = 0; i < 3; i++) {
            const response = await request(app)
                .post('/register-interest')
                .send({
                    email: email,
                    url: urls[i]
                });
            
            expect(response.status).toBe(302);
            expect(response.headers.location).not.toContain('error');
            
            // Optional: Add small delay between requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Verify the assessments were created
        const assessments = await Assessment.find({});
        expect(assessments.length).toBe(3);

        // Fourth request should be rate limited
        const finalResponse = await request(app)
            .post('/register-interest')
            .send({
                email: email,
                url: urls[3]
            });

        expect(finalResponse.status).toBe(302);
        expect(finalResponse.headers.location).toContain('error=rate_limit');

        // Verify no additional assessment was created
        const finalAssessments = await Assessment.find({});
        expect(finalAssessments.length).toBe(3);
    });

    test('should allow new assessment after 24 hours', async () => {
        const email = 'test@example.com';
        
        // Create 3 assessments with timestamps from yesterday
        const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000);
        const user = await User.create({
            email,
            websiteUrl: 'https://example.com',
            activeUrls: ['https://example.com'],
            createdAt: yesterday
        });

        for (let i = 0; i < 3; i++) {
            await Assessment.create({
                websiteUrl: `https://site${i}.com`,
                sessionId: `session${i}`,
                userId: user._id,
                status: 'completed',
                created: yesterday,
                compound_key: `session${i}-${`https://site${i}.com`.replace(/[^a-zA-Z0-9]/g, '')}`
            });
        }

        // New submission should succeed
        const response = await request(app)
            .post('/register-interest')
            .send({
                email: email,
                url: 'https://newsite.com'
            });

        expect(response.status).toBe(302);
        expect(response.headers.location).not.toContain('error');

        // Verify new assessment was created
        const assessments = await Assessment.find({}).sort({ created: -1 });
        expect(assessments.length).toBe(4);
        expect(assessments[0].websiteUrl).toBe('https://newsite.com');
    });
}); 