const PreviewRequest = require('../models/PreviewRequest');
const { captureScreenshots } = require('./captureScreenshot');
const { generateReportPreview } = require('./claudeService');

async function generateQuickPreview(websiteUrl, sessionId) {
  try {
    // Create initial database entry
    let previewRequest = new PreviewRequest({
      websiteUrl,
      sessionId,
      status: 'processing'
    });
    await previewRequest.save();

    // Capture only desktop screenshot
    const screenshots = await captureScreenshots(websiteUrl, ['desktop']);
    const desktopScreenshot = screenshots[0];

    try {
      // Try to generate preview report using Claude
      const previewReport = await generateReportPreview([desktopScreenshot], websiteUrl);
      
      // Update database entry with both screenshot and report
      previewRequest = await PreviewRequest.findOneAndUpdate(
        { sessionId },
        {
          status: 'completed',
          screenshot: {
            image: desktopScreenshot.image,
            timestamp: new Date()
          },
          previewReport
        },
        { new: true }
      );
    } catch (aiError) {
      console.error('Error generating AI preview:', aiError);
      
      // Still save the screenshot even if AI preview fails
      previewRequest = await PreviewRequest.findOneAndUpdate(
        { sessionId },
        {
          status: 'completed',
          screenshot: {
            image: desktopScreenshot.image,
            timestamp: new Date()
          }
        },
        { new: true }
      );
    }

    return previewRequest;
  } catch (error) {
    await PreviewRequest.findOneAndUpdate(
      { sessionId },
      { status: 'failed' }
    );
    throw error;
  }
}

module.exports = { generateQuickPreview }; 