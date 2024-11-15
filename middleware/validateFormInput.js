// middleware/validateFormInput.js
const { URL } = require('url');

const validateFormInput = (req, res, next) => {
    if (req.skipValidation || req.rateLimitExceeded) {
        return next();
    }

    const { email, url } = req.body;
    const errors = {};

    // Email validation
    if (!email) {
        errors.emailError = 'Email is required';
    } else if (email.length > 254) {
        errors.emailError = 'Email is too long';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.emailError = 'Enter a valid email address';
    }

    // URL validation
    if (!url) {
        errors.urlError = 'Website URL is required';
    } else if (url.length > 2048) {
        errors.urlError = 'URL is too long';
    } else {
        try {
            const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
            
            // Ensure protocol is http or https
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                errors.urlError = 'URL must use HTTP or HTTPS protocol';
            }
            
            // Check for private/reserved IP addresses
            const hostname = parsedUrl.hostname.toLowerCase();
            const isPrivateIP = 
                hostname === 'localhost' ||
                /^127\./.test(hostname) ||
                /^192\.168\./.test(hostname) ||
                /^10\./.test(hostname) ||
                /^169\.254\./.test(hostname) ||
                /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
                hostname.endsWith('.local') ||
                hostname.endsWith('.internal');
            
            if (isPrivateIP) {
                errors.urlError = 'Enter a public website URL';
            }
            
            // Basic TLD validation (at least 2 characters after last dot)
            if (!/\.[a-z]{2,}$/i.test(hostname)) {
                errors.urlError = 'Enter a valid domain';
            }
        } catch (error) {
            errors.urlError = 'Enter a valid website URL';
        }
    }

    if (Object.keys(errors).length > 0) {
        const queryParams = new URLSearchParams({
            error: 'validation_error',
            email: email || '',
            url: url || '',
            emailError: errors.emailError || '',
            urlError: errors.urlError || ''
        });
        return res.redirect(`/?${queryParams.toString()}`);
    }

    next();
};

module.exports = validateFormInput;