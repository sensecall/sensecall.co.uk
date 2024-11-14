async function generateLighthouseReport(url) {
  try {
    // Dynamically import both modules
    const [{ default: lighthouse }, { default: chromeLauncher }] = await Promise.all([
      import('lighthouse'),
      import('chrome-launcher')
    ]);

    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
    });

    try {
      const options = {
        logLevel: 'info',
        output: 'json',
        port: chrome.port,
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      };

      const runnerResult = await lighthouse(url, options);
      const reportJson = runnerResult.report;
      
      return {
        scores: {
          performance: runnerResult.lhr.categories.performance.score * 100,
          accessibility: runnerResult.lhr.categories.accessibility.score * 100,
          bestPractices: runnerResult.lhr.categories['best-practices'].score * 100,
          seo: runnerResult.lhr.categories.seo.score * 100
        },
        rawReport: reportJson
      };
    } finally {
      await chrome.kill();
    }
  } catch (error) {
    console.error('Lighthouse analysis failed:', error);
    throw error;
  }
}

module.exports = { generateLighthouseReport };
