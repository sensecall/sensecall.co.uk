const express = require('express');
const router = express.Router();
const PreviewRequest = require('../../models/PreviewRequest');

router.get('/preview-status/:sessionId', async (req, res) => {
    try {
        const preview = await PreviewRequest.findOne({ 
            sessionId: req.params.sessionId 
        });

        if (!preview) {
            return res.status(404).json({ 
                error: 'Preview not found',
                status: 'failed'
            });
        }

        // Return full preview data
        res.json({
            status: preview.status,
            screenshot: preview.screenshot,
            previewReport: preview.previewReport,
            error: preview.error
        });
    } catch (error) {
        console.error('Error fetching preview status:', error);
        res.status(500).json({ 
            error: 'Failed to fetch preview status',
            status: 'failed'
        });
    }
});

module.exports = router; 