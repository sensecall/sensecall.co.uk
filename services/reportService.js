// services/reportService.js
const ReportRequest = require('../models/ReportRequest');
const { captureScreenshots } = require('./captureScreenshot');
const { generateReportPreview } = require('./claudeService');
const fs = require('fs/promises');
const path = require('path');
const Jimp = require('jimp');

async function compressScreenshot(buffer) {
  const image = await Jimp.read(Buffer.from(buffer, 'base64'));
  return image
    .quality(60)
    .getBufferAsync(Jimp.MIME_JPEG);
}

async function processWebsiteReport(websiteUrl, sessionId) {
  try {
    // Create initial database entry
    let reportRequest = new ReportRequest({
      websiteUrl,
      sessionId,
      status: 'processing'
    });
    await reportRequest.save();

    // Capture screenshots
    const screenshots = await captureScreenshots(websiteUrl);
    
    // Compress screenshots
    const compressedScreenshots = await Promise.all(
      screenshots.map(async (screenshot) => ({
        ...screenshot,
        image: (await compressScreenshot(screenshot.image)).toString('base64')
      }))
    );

    // Generate report preview using Claude
    const previewReport = await generateReportPreview(compressedScreenshots, websiteUrl);

    // Update database entry
    reportRequest = await ReportRequest.findOneAndUpdate(
      { sessionId },
      {
        status: 'completed',
        screenshots: compressedScreenshots.map(s => ({
          breakpoint: s.breakpoint,
          path: `${sessionId}/${s.breakpoint.width}x${s.breakpoint.height}.jpg`
        })),
        previewReport
      },
      { new: true }
    );

    // Cleanup temporary files
    await cleanup(sessionId);

    return reportRequest;
  } catch (error) {
    await ReportRequest.findOneAndUpdate(
      { sessionId },
      { status: 'failed' }
    );
    throw error;
  }
}

const cleanup = async (sessionId) => {
  const screenshotsPath = path.join(__dirname, '../tmp', sessionId);
  try {
    // Ensure parent tmp directory exists
    await fs.mkdir(path.dirname(screenshotsPath), { recursive: true });
    await fs.rm(screenshotsPath, { recursive: true, force: true });
  } catch (error) {
    console.error(`Failed to cleanup temporary files for session ${sessionId}:`, error);
  }
};

module.exports = { processWebsiteReport };