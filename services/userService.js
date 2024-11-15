const User = require('../models/User');
const Assessment = require('../models/Assessment');
const crypto = require('crypto');

async function registerUserInterest(email, url) {
    if (!email || !url) {
        throw new Error('MISSING_FIELDS');
    }

    const normalisedUrl = normaliseUrl(url);

    let user;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        // Check if the user has recently assessed the same website
        const recentAssessment = await Assessment.findOne({
            userId: existingUser._id,
            websiteUrl: normalisedUrl,
            created: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (recentAssessment) {
            return {
                sessionId: recentAssessment.sessionId,
                user: existingUser,
                assessment: recentAssessment,
                status: 'EXISTING_RECENT_ASSESSMENT'
            };
        }

        // Check rate limit across all URLs
        const assessmentCount = await Assessment.countDocuments({
            userId: existingUser._id,
            created: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (assessmentCount >= 3) {
            throw new Error('RATE_LIMIT_EXCEEDED');
        }

        // Add new URL to activeUrls if it doesn't exist
        existingUser.activeUrls = existingUser.activeUrls || [];
        if (!existingUser.activeUrls.includes(normalisedUrl)) {
            existingUser.activeUrls.push(normalisedUrl);
            user = await existingUser.save();
        } else {
            user = existingUser;
        }
    } else {
        // Create new user with activeUrls array
        user = new User({
            email,
            websiteUrl: normalisedUrl,
            activeUrls: [normalisedUrl],
            createdAt: new Date()
        });
        await user.save();
    }

    // Generate a new session ID for the assessment
    const sessionId = crypto.randomBytes(16).toString('hex');

    // Create a new assessment record
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