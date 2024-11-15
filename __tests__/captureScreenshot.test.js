const { captureScreenshots } = require('../services/captureScreenshot');
const puppeteer = require('puppeteer-extra');

// Mock puppeteer and its plugins
jest.mock('puppeteer-extra', () => ({
  use: jest.fn(),
  launch: jest.fn()
}));

jest.mock('puppeteer-extra-plugin-stealth', () => jest.fn());

describe('captureScreenshots', () => {
  let mockBrowser;
  let mockPage;

  beforeEach(() => {
    // Add timer mocks
    jest.useFakeTimers();
    
    // Mock setTimeout to execute immediately
    jest.spyOn(global, 'setTimeout').mockImplementation((fn) => fn());
    
    // Mock Promise.resolve to execute immediately
    jest.spyOn(Promise, 'resolve').mockImplementation((value) => value);

    // Reset all mocks
    jest.clearAllMocks();

    // Create mock page object
    mockPage = {
      setViewport: jest.fn(),
      goto: jest.fn(),
      evaluate: jest.fn(),
      screenshot: jest.fn(),
      close: jest.fn()
    };

    // Create mock browser object
    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn()
    };

    // Setup puppeteer launch mock
    puppeteer.launch.mockResolvedValue(mockBrowser);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should capture screenshot for desktop breakpoint', async () => {
    const url = 'https://example.com';
    mockPage.screenshot.mockResolvedValue('base64-encoded-image');

    const screenshots = await captureScreenshots(url);

    expect(screenshots).toHaveLength(1);
    expect(screenshots[0].breakpoint).toEqual({ width: 1366, height: 768 });
    expect(screenshots[0].image).toBe('base64-encoded-image');
    expect(screenshots[0].timestamp).toBeDefined();
  });

  test('should capture screenshots for all breakpoints', async () => {
    const url = 'https://example.com';
    mockPage.screenshot.mockResolvedValue('base64-encoded-image');

    const screenshots = await captureScreenshots(url, ['mobile', 'tablet', 'desktop']);

    expect(screenshots).toHaveLength(3);
    expect(screenshots.map(s => s.breakpoint)).toEqual([
      { width: 320, height: 568 },
      { width: 768, height: 1024 },
      { width: 1366, height: 768 }
    ]);
  });

  test('should handle navigation timeout', async () => {
    const url = 'https://example.com';
    mockPage.goto.mockRejectedValue(new Error('Navigation timeout'));

    await expect(captureScreenshots(url)).rejects.toThrow('Navigation timeout');
    expect(mockBrowser.close).toHaveBeenCalled();
  });

  test('should handle screenshot capture failure', async () => {
    const url = 'https://example.com';
    mockPage.screenshot.mockRejectedValue(new Error('Screenshot failed'));

    await expect(captureScreenshots(url)).rejects.toThrow('Screenshot failed');
    expect(mockPage.close).toHaveBeenCalled();
    expect(mockBrowser.close).toHaveBeenCalled();
  });

  test('should handle invalid breakpoint type', async () => {
    const url = 'https://example.com';
    
    await expect(captureScreenshots(url, ['invalid-breakpoint']))
      .rejects.toThrow();
  });

  test('should set correct viewport options', async () => {
    const url = 'https://example.com';
    mockPage.screenshot.mockResolvedValue('base64-encoded-image');

    await captureScreenshots(url, ['mobile']);

    expect(mockPage.setViewport).toHaveBeenCalledWith({
      width: 320,
      height: 568,
      deviceScaleFactor: 1,
      isMobile: true
    });
  });

  test('should handle browser launch failure', async () => {
    const url = 'https://example.com';
    puppeteer.launch.mockRejectedValue(new Error('Browser launch failed'));

    await expect(captureScreenshots(url)).rejects.toThrow('Browser launch failed');
  });

  test('should use correct browser options', async () => {
    const url = 'https://example.com';
    mockPage.screenshot.mockResolvedValue('base64-encoded-image');

    await captureScreenshots(url);

    expect(puppeteer.launch).toHaveBeenCalledWith({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
  });

  test('should handle page creation failure', async () => {
    const url = 'https://example.com';
    mockBrowser.newPage.mockRejectedValue(new Error('Page creation failed'));

    await expect(captureScreenshots(url)).rejects.toThrow('Page creation failed');
    expect(mockBrowser.close).toHaveBeenCalled();
  });

  test('should scroll page before taking screenshot', async () => {
    const url = 'https://example.com';
    mockPage.screenshot.mockResolvedValue('base64-encoded-image');
    
    // Mock the evaluate function to resolve immediately
    mockPage.evaluate.mockImplementation((fn) => {
      if (fn) return Promise.resolve(fn());
      return Promise.resolve();
    });

    await captureScreenshots(url);

    expect(mockPage.evaluate).toHaveBeenCalledTimes(2);
    expect(mockPage.evaluate).toHaveBeenCalledWith(expect.any(Function));
  });
});