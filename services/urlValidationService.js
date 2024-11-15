const fetch = require('node-fetch');
const dns = require('dns');
const { promisify } = require('util');

const dnsLookup = promisify(dns.lookup);

const ValidationError = {
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_PROTOCOL: 'INVALID_PROTOCOL',
  DNS_LOOKUP_FAILED: 'DNS_LOOKUP_FAILED',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  INVALID_STATUS: 'INVALID_STATUS',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

async function validateUrl(url) {
    console.log(`🔍 Validating URL: ${url}`);
    
    try {
        // Ensure URL is properly formatted
        let parsedUrl;
        try {
            parsedUrl = new URL(url);
            if (!parsedUrl.protocol.startsWith('http')) {
                return {
                    valid: false,
                    error: ValidationError.INVALID_PROTOCOL,
                    message: 'Invalid protocol - must be http or https'
                };
            }
        } catch (error) {
            return {
                valid: false,
                error: ValidationError.INVALID_FORMAT,
                message: 'Invalid URL format'
            };
        }

        // Check if domain resolves
        try {
            await dnsLookup(parsedUrl.hostname);
        } catch (error) {
            return {
                valid: false,
                error: ValidationError.DNS_LOOKUP_FAILED,
                message: 'Domain cannot be resolved'
            };
        }

        // Try to fetch the website
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; SiteHero/1.0)'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                console.log(`❌ URL validation failed: Status ${response.status}`);
                return {
                    valid: false,
                    error: ValidationError.INVALID_STATUS,
                    message: `Site returned status code: ${response.status}`,
                    status: response.status
                };
            }

            console.log('✅ URL validation successful');
            return {
                valid: true,
                status: response.status,
                contentType: response.headers.get('content-type')
            };
        } catch (error) {
            return {
                valid: false,
                error: error.name === 'AbortError' ? 
                    ValidationError.CONNECTION_TIMEOUT : 
                    ValidationError.CONNECTION_FAILED,
                message: error.name === 'AbortError' ? 
                    'Site took too long to respond' : 
                    'Failed to connect to site'
            };
        }
    } catch (error) {
        return {
            valid: false,
            error: ValidationError.UNKNOWN_ERROR,
            message: 'Validation failed'
        };
    }
}

module.exports = { validateUrl, ValidationError }; 