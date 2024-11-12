const puppeteer = require('puppeteer');

exports.handler = async (event, context) => {
    const { url } = JSON.parse(event.body);

    if (!url) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'URL is required' }),
        };
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const breakpoints = [
        { width: 320, height: 480 },
        { width: 768, height: 1024 },
        { width: 1280, height: 800 }
    ];

    const screenshots = [];

    for (const breakpoint of breakpoints) {
        await page.setViewport({ width: breakpoint.width, height: breakpoint.height });
        await page.goto(url, { waitUntil: 'networkidle2' });

        const screenshotBuffer = await page.screenshot();
        const base64Image = screenshotBuffer.toString('base64');
        screenshots.push({
            breakpoint,
            image: base64Image
        });
    }

    await browser.close();

    return {
        statusCode: 200,
        body: JSON.stringify({ screenshots }),
    };
};