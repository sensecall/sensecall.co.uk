const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res) => {
    res.render('pages/index.njk', {
        title: 'Home',
        description: 'Your Digital Presence Probably Needs a Little Work'
    });
});

// Projects page
router.get('/projects', (req, res) => {
    res.render('pages/projects.njk', {
        title: 'Projects and case studies',
        description: 'A selection of projects by UI UX Ltd, a digital service design agency helping organisations solve complex problems through user-centred design.'
    });
});

// Individual project pages
router.get('/projects/:slug', (req, res) => {
    // You'll need to implement project data fetching here
    res.render('projects/' + req.params.slug + '.njk', {
        title: 'Project Details',
        // Add other project-specific data
    });
});

// Contact page
router.get('/contact', (req, res) => {
    res.render('pages/contact.njk', {
        title: 'Contact',
        description: 'Get in touch to discuss your project'
    });
});

module.exports = router;