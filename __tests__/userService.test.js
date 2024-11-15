const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { registerUserInterest } = require('../services/userService');
const User = require('../models/User');
const Assessment = require('../models/Assessment');

let mongoServer;

describe('UserService Tests', () => {
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

    describe('registerUserInterest', () => {
        test('should throw error when email is missing', async () => {
            await expect(registerUserInterest(null, 'https://example.com'))
                .rejects
                .toThrow('MISSING_FIELDS');
        });

        test('should throw error when url is missing', async () => {
            await expect(registerUserInterest('test@example.com', null))
                .rejects
                .toThrow('MISSING_FIELDS');
        });

        test('should successfully register user interest with valid data', async () => {
            const testEmail = 'test@example.com';
            const testUrl = 'https://example.com';

            const result = await registerUserInterest(testEmail, testUrl);

            // Verify the result contains expected data
            expect(result).toBeTruthy();
            expect(result.user).toBeTruthy();
            expect(result.assessment).toBeTruthy();

            // Verify user was created in database
            const user = await User.findOne({ email: testEmail });
            expect(user).toBeTruthy();
            expect(user.email).toBe(testEmail);
            expect(user.activeUrls).toContain(testUrl);

            // Verify assessment was created
            const assessment = await Assessment.findOne({ userId: user._id });
            expect(assessment).toBeTruthy();
            expect(assessment.websiteUrl).toBe(testUrl);
            expect(assessment.status).toBe('pending');
        });

        test('should add new URL to existing user', async () => {
            const testEmail = 'test@example.com';
            const firstUrl = 'https://first-example.com';
            const secondUrl = 'https://second-example.com';

            // Register first URL
            await registerUserInterest(testEmail, firstUrl);

            // Register second URL
            const result = await registerUserInterest(testEmail, secondUrl);

            // Verify user has both URLs
            const user = await User.findOne({ email: testEmail });
            expect(user.activeUrls).toContain(firstUrl);
            expect(user.activeUrls).toContain(secondUrl);
            expect(user.activeUrls).toHaveLength(2);

            // Verify new assessment was created
            const assessments = await Assessment.find({ userId: user._id });
            expect(assessments).toHaveLength(2);
        });
    });
}); 