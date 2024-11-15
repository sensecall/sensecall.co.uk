const { validateUrl } = require('../services/urlValidationService');

describe('URL Validation Service', () => {
  test('should validate correct https URL', async () => {
    const result = await validateUrl('https://example.com');
    expect(result.valid).toBe(true);
  });

  test('should reject invalid URL format', async () => {
    const result = await validateUrl('not-a-url');
    expect(result.valid).toBe(false);
  });
});
