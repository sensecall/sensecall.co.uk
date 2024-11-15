const User = require('../models/User');
const Assessment = require('../models/Assessment');
const crypto = require('crypto');
const mongoose = require('mongoose');

/**
 * Registers a user's interest in assessing a website
 * @param {string} email - User's email address
 * @param {string} url - Website URL to be assessed
 * @returns {Object} Contains sessionId, user object, assessment object and status
 */
async function registerUserInterest(email, url) {
    try {
        // Validate required fields
        if (!email || !url) {
            throw new Error('MISSING_FIELDS');
        }

        // Standardise the URL format
        const normalisedUrl = normaliseUrl(url);

        // Use findOneAndUpdate with upsert to atomically create or update user
        let user = await User.findOneAndUpdate(
            { email },
            {
                $setOnInsert: {
                    websiteUrl: normalisedUrl,
                    createdAt: new Date()
                },
                $addToSet: { activeUrls: normalisedUrl }
            },
            { 
                upsert: true, 
                new: true 
            }
        );

        // Check for recent assessment using atomic findOne
        const recentAssessment = await Assessment.findOne({
            userId: user._id,
            websiteUrl: normalisedUrl,
            created: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (recentAssessment) {
            return {
                sessionId: recentAssessment.sessionId,
                user,
                assessment: recentAssessment,
                status: 'EXISTING_RECENT_ASSESSMENT'
            };
        }

        // Rate limiting check
        const assessmentCount = await Assessment.countDocuments({
            userId: user._id,
            created: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (assessmentCount >= 3) {
            throw new Error('RATE_LIMIT_EXCEEDED');
        }

        // Create new assessment with unique compound key
        const sessionId = crypto.randomBytes(16).toString('hex');
        const compound_key = `${user._id}_${normalisedUrl}_${new Date().toDateString()}`;
        
        const assessment = await Assessment.findOneAndUpdate(
            { compound_key },
            {
                $setOnInsert: {
                    websiteUrl: normalisedUrl,
                    sessionId,
                    userId: user._id,
                    status: 'pending',
                    created: new Date(),
                    compound_key
                }
            },
            { 
                upsert: true, 
                new: true 
            }
        );

        return { sessionId, user, assessment, status: 'NEW_ASSESSMENT' };
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error
            // Handle duplicate assessment creation
            const existingAssessment = await Assessment.findOne({
                userId: user._id,
                websiteUrl: normalisedUrl,
                created: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });
            
            if (existingAssessment) {
                return {
                    sessionId: existingAssessment.sessionId,
                    user,
                    assessment: existingAssessment,
                    status: 'EXISTING_RECENT_ASSESSMENT'
                };
            }
        }
        throw error;
    }
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