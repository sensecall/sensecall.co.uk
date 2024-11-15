const User = require('../models/User');
const Assessment = require('../models/Assessment');
const crypto = require('crypto');

/**
 * Registers a user's interest in assessing a website
 * @param {string} email - User's email address
 * @param {string} url - Website URL to be assessed
 * @returns {Object} Contains sessionId, user object, assessment object and status
 */
async function registerUserInterest(email, url) {
    // Validate required fields
    if (!email || !url) {
        throw new Error('MISSING_FIELDS');
    }

    // Standardise the URL format
    const normalisedUrl = normaliseUrl(url);

    // Check if user exists
    let user;
    const existingUser = await User.findOne({ email });

    // If user exists, check if they've assessed this website in the last 24 hours
    if (existingUser) {
        const recentAssessment = await Assessment.findOne({
            userId: existingUser._id,
            websiteUrl: normalisedUrl,
            created: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        });

        // If recent assessment exists, return existing session
        if (recentAssessment) {
            return {
                sessionId: recentAssessment.sessionId,
                user: existingUser,
                assessment: recentAssessment,
                status: 'EXISTING_RECENT_ASSESSMENT'
            };
        }

        // Rate limiting: Check if user has made more than 3 assessments in 24 hours
        const assessmentCount = await Assessment.countDocuments({
            userId: existingUser._id,
            created: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (assessmentCount >= 3) {
            throw new Error('RATE_LIMIT_EXCEEDED');
        }

        // Update user's active URLs if new URL
        existingUser.activeUrls = existingUser.activeUrls || [];
        if (!existingUser.activeUrls.includes(normalisedUrl)) {
            existingUser.activeUrls.push(normalisedUrl);
            user = await existingUser.save();
        } else {
            user = existingUser;
        }
    } else {
        // Create new user if they don't exist
        user = new User({
            email,
            websiteUrl: normalisedUrl,
            activeUrls: [normalisedUrl],
            createdAt: new Date()
        });
        await user.save();
    }

    // Create new assessment session
    const sessionId = crypto.randomBytes(16).toString('hex');
    const assessment = new Assessment({
        websiteUrl: normalisedUrl,
        sessionId,
        userId: user._id,
        status: 'pending',
        created: new Date()
    });

    await assessment.save();

    return { sessionId, user, assessment, status: 'NEW_ASSESSMENT' };
}

/**
 * Standardises URL format by:
 * 1. Removing trailing slashes
 * 2. Adding https:// if protocol is missing
 * @param {string} url - URL to normalise
 * @returns {string} Normalised URL
 */
function normaliseUrl(url) {
    url = url.replace(/\/$/, '');
    
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }
    
    return url;
}

module.exports = {
    registerUserInterest
}; 