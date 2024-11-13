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
const { router: screenshotRouter } = require('./captureScreenshot');

require('dotenv').config();
const env = process.env.NODE_ENV;
