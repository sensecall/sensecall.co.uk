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