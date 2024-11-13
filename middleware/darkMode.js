const darkModeMiddleware = (req, res, next) => {
    // Get dark mode preference from cookie or default
    res.locals.darkMode = req.cookies.darkMode === 'true';
    next();
};

module.exports = darkModeMiddleware; 