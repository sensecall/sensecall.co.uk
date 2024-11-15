const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const ReportRequest = require('../models/ReportRequest');
const PreviewRequest = require('../models/PreviewRequest');

let mongoServer;

describe('MongoDB Tests', () => {
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
    await ReportRequest.deleteMany({});
    await PreviewRequest.deleteMany({});
  });

  describe('Model Relationships', () => {
    test('should create user with multiple assessments', async () => {
      const user = await User.create({
        email: 'test@example.com',
        websiteUrl: 'https://example.com'
      });

      const assessments = await Promise.all([
        Assessment.create({
          sessionId: 'session-1',
          userId: user._id,
          websiteUrl: 'https://site1.com',
          status: 'completed'
        }),
        Assessment.create({
          sessionId: 'session-2',
          userId: user._id,
          websiteUrl: 'https://site2.com',
          status: 'pending'
        })
      ]);

      const userAssessments = await Assessment.find({ userId: user._id });
      expect(userAssessments).toHaveLength(2);
      expect(userAssessments[0].websiteUrl).toBe('https://site1.com');
      expect(userAssessments[1].websiteUrl).toBe('https://site2.com');
    });

    test('should track assessment progression through preview and full report', async () => {
      // Create initial preview request
      const preview = await PreviewRequest.create({
        websiteUrl: 'https://example.com',
        sessionId: 'preview-session',
        status: 'completed',
        screenshot: {
          image: 'base64string',
          timestamp: new Date()
        }
      });

      // Create full report request
      const report = await ReportRequest.create({
        websiteUrl: preview.websiteUrl,
        sessionId: 'report-session',
        status: 'pending'
      });

      // Update preview to mark full report requested
      await PreviewRequest.findByIdAndUpdate(preview._id, {
        fullReportRequested: true
      });

      const updatedPreview = await PreviewRequest.findById(preview._id);
      expect(updatedPreview.fullReportRequested).toBe(true);
      expect(report.websiteUrl).toBe(preview.websiteUrl);
    });
  });

  describe('Model Validations', () => {
    test('should enforce required fields', async () => {
      const invalidModels = [
        User.create({}),
        Assessment.create({}),
        PreviewRequest.create({}),
        ReportRequest.create({})
      ];

      await Promise.all(
        invalidModels.map(promise =>
          expect(promise).rejects.toThrow(/required/)
        )
      );
    });

    test('should enforce enum values for status fields', async () => {
      const invalidStatus = 'invalid-status';
      
      const invalidModels = [
        Assessment.create({
          sessionId: 'test',
          websiteUrl: 'https://example.com',
          status: invalidStatus
        }),
        PreviewRequest.create({
          sessionId: 'test',
          websiteUrl: 'https://example.com',
          status: invalidStatus
        }),
        ReportRequest.create({
          sessionId: 'test',
          websiteUrl: 'https://example.com',
          status: invalidStatus
        })
      ];

      await Promise.all(
        invalidModels.map(promise =>
          expect(promise).rejects.toThrow(/is not a valid enum value/)
        )
      );
    });
  });

  describe('Data Integrity', () => {
    test('should maintain activeUrls array for users', async () => {
      const user = await User.create({
        email: 'test@example.com',
        websiteUrl: 'https://example.com',
        activeUrls: ['https://site1.com', 'https://site2.com']
      });

      expect(user.activeUrls).toHaveLength(2);
      expect(user.activeUrls).toContain('https://site1.com');
      expect(user.activeUrls).toContain('https://site2.com');

      user.activeUrls.push('https://site3.com');
      await user.save();

      const updatedUser = await User.findById(user._id);
      expect(updatedUser.activeUrls).toHaveLength(3);
      expect(updatedUser.activeUrls).toContain('https://site3.com');
    });

    test('should handle assessment screenshots data structure', async () => {
      const assessment = await Assessment.create({
        sessionId: 'test-session',
        websiteUrl: 'https://example.com',
        status: 'completed',
        screenshots: [{
          breakpoint: {
            width: 1920,
            height: 1080
          },
          image: 'base64string',
          timestamp: new Date()
        }]
      });

      const found = await Assessment.findById(assessment._id);
      expect(found.screenshots[0].breakpoint.width).toBe(1920);
      expect(found.screenshots[0].breakpoint.height).toBe(1080);
      expect(found.screenshots[0].image).toBe('base64string');
    });
  });
}); 