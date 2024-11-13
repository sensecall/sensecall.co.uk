// services/claudeService.js
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const claude = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY
});

const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2);
  }
};

async function generateReportPreview(screenshots, websiteUrl) {
  try {
    const prompt = `You are an expert web designer and UX consultant. Analyze these screenshots of ${websiteUrl} and provide a brief, constructive critique focusing on:
    1. Initial visual impact
    2. Key UX issues
    3. Most important improvement suggestions
    Keep the response concise and professional but honest.`;

    const response = await retry(() => claude.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          ...screenshots.map(screenshot => ({
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: screenshot.image
            }
          }))
        ]
      }]
    }));

    return response.content[0].text;
  } catch (error) {
    console.error('Error generating report preview:', error);
    throw error;
  }
}

module.exports = { generateReportPreview };