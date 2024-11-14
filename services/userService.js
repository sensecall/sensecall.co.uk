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

        const assessmentCount = await Assessment.countDocuments({
            userId: existingUser._id,
            created: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (assessmentCount >= 3) {
            throw new Error('RATE_LIMIT_EXCEEDED');
        }

        if (existingUser.websiteUrl !== normalisedUrl) {
            existingUser.previousUrls = existingUser.previousUrls || [];
            existingUser.previousUrls.push(existingUser.websiteUrl);
            existingUser.websiteUrl = normalisedUrl;
            user = await existingUser.save();
        } else {
            user = existingUser;
        }
    } else {
        user = new User({
            email,
            websiteUrl: normalisedUrl,
            previousUrls: [],
            createdAt: new Date()
        });
        await user.save();
    }

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