const express = require('express');
const cookieParser = require('cookie-parser');
const nunjucks = require('nunjucks');
const path = require('path');
const routes = require('./routes');
const moment = require('moment');
const darkModeMiddleware = require('./middleware/darkMode');
const filters = require('./filters');
const browserSync = require('browser-sync');
const bs = browserSync.create();

const app = express();
const port = process.env.PORT || 3000;

// Add cookie-parser middleware before other middleware
app.use(cookieParser());

// Configure Nunjucks
const njEnvironment = nunjucks.configure('src', {
    autoescape: true,
    express: app,
    watch: true // Set to false in production
});

// Add Nunjucks filters
Object.keys(filters).forEach(filterName => {
    njEnvironment.addFilter(filterName, filters[filterName]);
});

// Add global variables available in all templates
njEnvironment.addGlobal('year', new Date().getFullYear());

// Move static file middleware before routes and other middleware
app.use('/css', express.static(path.join(__dirname, 'src/assets/css')));
app.use('/js', express.static(path.join(__dirname, 'src/assets/js')));
app.use('/assets', express.static(path.join(__dirname, 'src/assets')));

// Move URL logging middleware before routes
app.use((req, res, next) => {
    console.log(`Page URL: ${req.url}`);
    next();
});

// Use routes
app.use('/', routes);

// Use dark mode middleware
app.use(darkModeMiddleware);

// Error handling
app.use((req, res, next) => {
    res.status(404).render('pages/404.njk', {
        title: '404 - Page Not Found',
        description: 'The page you are looking for does not exist'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('pages/500.njk', {
        title: '500 - Server Error',
        description: 'Something went wrong'
    });
});

// Function to start the server
function startServer(port) {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        
        if (process.env.NODE_ENV !== 'production') {
            bs.init({
                proxy: `localhost:${port}`,
                files: [
                    'src/**/*.{njk,css,js}',
                    'src/assets/css/style.css'
                ],
                notify: false,
                open: false,
                reloadDelay: 500,
                reloadDebounce: 500
            });
        }
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying ${port + 1}`);
            startServer(port + 1);
        } else {
            console.error(err);
        }
    });
}

// Start the server
startServer(port);
