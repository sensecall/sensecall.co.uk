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
const validateFormInput = require('../middleware/validateFormInput');

// Setup express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', router);

describe('Landing Page Form Tests', () => {
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

    describe('Form Validation', () => {
        test('should reject invalid email formats', async () => {
            const response = await request(app)
                .post('/register-interest')
                .send({
                    email: 'invalid-email',
                    url: 'https://example.com'
                });

            expect(response.status).toBe(302); // Redirect on error
            expect(response.headers.location).toContain('emailError');
        });

        test('should reject invalid URL formats', async () => {
            const response = await request(app)
                .post('/register-interest')
                .send({
                    email: 'test@example.com',
                    url: 'not-a-url'
                });

            expect(response.status).toBe(302);
            expect(response.headers.location).toContain('urlError');
        });

        test('should reject private/internal URLs', async () => {
            const privateUrls = [
                'http://localhost',
                'http://127.0.0.1',
                'http://192.168.1.1',
                'http://10.0.0.1',
                'http://internal.local'
            ];

            for (const url of privateUrls) {
                const response = await request(app)
                    .post('/register-interest')
                    .send({
                        email: 'test@example.com',
                        url: url
                    });

                expect(response.status).toBe(302);
                expect(response.headers.location).toContain('urlError');
            }
        });
    });

    describe('MongoDB Injection Protection', () => {
        test('should sanitize inputs and prevent NoSQL injection', async () => {
            const maliciousInputs = [
                // NoSQL Injection attempts
                { 
                    email: { $gt: '' }, 
                    url: 'https://example.com'
                },
                { 
                    email: { $ne: null }, 
                    url: 'https://example.com'
                },
                { 
                    email: 'test@example.com', 
                    url: { $where: 'function() { return true; }' }
                },
                {
                    email: { $in: ['admin@example.com'] },
                    url: 'https://example.com'
                },
                // JavaScript injection attempts
                {
                    email: 'test@example.com"; return true; }); //',
                    url: 'https://example.com'
                },
                // Operator injection attempts
                {
                    email: 'test@example.com',
                    url: 'https://example.com", "$set": {"admin": true}}'
                },
                // Command injection attempts
                {
                    email: '{"$gt": ""}, "url": "https://example.com", "roles": {"$in": ["admin"]}}',
                    url: 'https://example.com'
                }
            ];

            for (const input of maliciousInputs) {
                const response = await request(app)
                    .post('/register-interest')
                    .send(input);

                // Should either redirect with error or sanitize the input
                expect(response.status).toBe(302);

                // Verify no documents were created with malicious data
                const users = await User.find({});
                users.forEach(user => {
                    // Verify email is a valid string
                    expect(typeof user.email).toBe('string');
                    expect(user.email).not.toContain('$');
                    expect(user.email).not.toContain('{');
                    expect(user.email).not.toContain('}');
                    
                    // Verify URL is a valid string
                    expect(typeof user.websiteUrl).toBe('string');
                    expect(user.websiteUrl).not.toContain('$');
                    expect(user.websiteUrl).not.toContain('{');
                    expect(user.websiteUrl).not.toContain('}');
                    
                    // Verify no additional fields were injected
                    const userObj = user.toObject();
                    const allowedFields = ['_id', 'email', 'websiteUrl', 'activeUrls', 'createdAt', '__v'];
                    Object.keys(userObj).forEach(key => {
                        expect(allowedFields).toContain(key);
                    });
                });

                // Verify no malicious assessments were created
                const assessments = await Assessment.find({});
                assessments.forEach(assessment => {
                    expect(typeof assessment.websiteUrl).toBe('string');
                    expect(assessment.websiteUrl).not.toContain('$');
                    expect(assessment.websiteUrl).not.toContain('{');
                    expect(assessment.websiteUrl).not.toContain('}');
                });
            }

            // Verify total number of documents hasn't unexpectedly increased
            const totalUsers = await User.countDocuments({});
            expect(totalUsers).toBeLessThanOrEqual(maliciousInputs.length);
        });

        test('should handle nested NoSQL injection attempts', async () => {
            const nestedMaliciousInput = {
                email: 'test@example.com',
                url: 'https://example.com',
                $nested: {
                    $gt: '',
                    $where: 'function() { return true; }'
                }
            };

            const response = await request(app)
                .post('/register-interest')
                .send(nestedMaliciousInput);

            expect(response.status).toBe(302);
            
            // Verify no documents were affected
            const users = await User.find({});
            users.forEach(user => {
                const userObj = user.toObject();
                expect(userObj).not.toHaveProperty('$nested');
                expect(userObj).not.toHaveProperty('$where');
            });
        });
    });

    describe('Rate Limiting', () => {
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
                
                // Verify successful submission
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

            // Verify rate limit response
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
                    created: yesterday
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

    describe('Successful Submission', () => {
        test('should create user and assessment for valid submission', async () => {
            const testData = {
                email: `test${Math.random().toString(36).substring(7)}@example.com`,
                url: `https://example${Math.random().toString(36).substring(7)}.com`
            };

            const response = await request(app)
                .post('/register-interest')
                .send(testData);

            expect(response.status).toBe(302);
            expect(response.headers.location).not.toContain('error');

            // Verify user creation
            const user = await User.findOne({ email: testData.email });
            expect(user).toBeTruthy();
            expect(user.email).toBe(testData.email);
            expect(user.activeUrls).toContain(testData.url);

            // Verify assessment creation
            const assessment = await Assessment.findOne({ userId: user._id });
            expect(assessment).toBeTruthy();
            expect(assessment.websiteUrl).toBe(testData.url);
            expect(assessment.status).toBe('pending');
        });
    });
});