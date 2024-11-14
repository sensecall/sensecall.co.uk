const fetch = require('node-fetch');
const dns = require('dns');
const { promisify } = require('util');

const dnsLookup = promisify(dns.lookup);

async function validateUrl(url) {
    console.log(`\n🔍 Starting detailed URL validation for: ${url}`);
    
    try {
        // Ensure URL is properly formatted
        console.log('1️⃣ Checking URL format...');
        let parsedUrl;
        try {
            parsedUrl = new URL(url);
            if (!parsedUrl.protocol.startsWith('http')) {
                throw new Error('Invalid protocol - must be http or https');
            }
            console.log('✅ URL format is valid');
        } catch (error) {
            console.error('❌ URL format validation failed:', error.message);
            return {
                valid: false,
                error: 'Invalid URL format'
            };
        }

        // Check if domain resolves
        console.log('2️⃣ Performing DNS lookup...');
        try {
            await dnsLookup(parsedUrl.hostname);
            console.log('✅ DNS lookup successful');
        } catch (error) {
            console.error('❌ DNS lookup failed:', error.message);
            return {
                valid: false,
                error: 'Domain cannot be resolved'
            };
        }

        // Try to fetch the website
        console.log('3️⃣ Testing website response...');
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            console.log('📡 Sending HEAD request...');
            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; SiteHero/1.0)'
                }
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                return {
                    valid: false,
                    error: `Site returned status code: ${response.status}`
                };
            }

            return {
                valid: true,
                status: response.status,
                contentType: response.headers.get('content-type')
            };
        } catch (error) {
            return {
                valid: false,
                error: error.name === 'AbortError' ? 
                    'Site took too long to respond' : 
                    'Failed to connect to site'
            };
        }
    } catch (error) {
        console.error('❌ Validation failed:', error);
        return {
            valid: false,
            error: 'Validation failed'
        };
    }
}

module.exports = { validateUrl }; 