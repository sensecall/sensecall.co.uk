let Nunjucks = require("nunjucks");
const execSync = require('child_process').execSync;

module.exports = function (eleventyConfig) {
  // Set site URL for use in sitemap and other places
  eleventyConfig.addGlobalData("site", {
    url: "https://sensecall.co.uk",
    title: "Dan Sensecall",
    description: "Service Design & UX Consultant"
  });

  // Watch CSS files for changes
  eleventyConfig.setBrowserSyncConfig({
    files: './_site/css/**/*.css',
    // Add ignore patterns
    ignore: ['**/styles.css']
  });

  // Add a before build step to compile SASS
  eleventyConfig.on('beforeBuild', () => {
    // Compile SASS to CSS
    execSync('sass src/scss/main.scss:_site/css/styles.css');
  });

  // Add an after build step to process Tailwind
  eleventyConfig.on('afterBuild', () => {
    // Process Tailwind using the compiled CSS with minification
    execSync('npx tailwindcss -i _site/css/styles.css -o _site/css/styles.min.css --minify --content "./_site/**/*.html"');
  });

  eleventyConfig.addFilter('date', function(date, format) {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  });

  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy({ "src/assets/images": "assets/images" });
  eleventyConfig.addPassthroughCopy({ "src/demos": "demos" });
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // add nunjucks filter for showing the date in a nice format
  eleventyConfig.addFilter("niceDate", function (date) {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  });

  // Add a filter to get the index of the current item in a collection
  eleventyConfig.addFilter("getCollectionIndex", function(collection, page) {
    return collection.findIndex(item => item.url === page.url) + 1;
  });

  let nunjucksEnvironment = new Nunjucks.Environment(
    new Nunjucks.FileSystemLoader("src/_includes")
  );

  eleventyConfig.setLibrary("njk", nunjucksEnvironment);

  eleventyConfig.addCollection("logos", function (collectionApi) {
    let logos = [
      {
        'name': 'Home Office',
        'image': 'home-office-logo.svg'
      },
      {
        'name': 'Department for Education',
        'image': 'department-for-education-logo.svg'
      },
      {
        'name': 'Defra',
        'image': 'defra-logo.svg'
      },
      {
        'name': 'HM Courts & Tribunals Service',
        'image': 'hmcts-logo.svg'
      },
      {
        'name': 'Apprenticeships',
        'image': 'apprenticeships-logo.svg'
      },
      {
        'name': 'Ministry of Justice',
        'image': 'ministry-of-justice-logo.svg'
      },
      {
        'name': 'Sainsbury\'s',
        'image': 'sainsburys-logo.svg'
      },
      {
        'name': 'Education and Skills Funding Agency',
        'image': 'education-and-skills-funding-agency-logo.svg'
      },
      {
        'name': 'HM Prison & Probation Service',
        'image': 'hmpps-logo.svg'
      },
      {
        'name': 'npower',
        'image': 'npower-logo.svg'
      },
      {
        'name': 'National Crime Agency',
        'image': 'nca-logo.svg'
      }
    ];
    return logos;
  });

  eleventyConfig.addCollection("experiments", function (collectionApi) {
    let experiments = [
      {
        'title': 'Car cost comparison',
        'description': 'A tool to help compare the cost of buying a new car against the cost of keeping your current car.',
        'url': 'https://car.sensecall.co.uk',
        'why': 'I couldn\'t find a tool or spreadsheet that did a decent job of helping me compare the cost of buying a new car against the cost of keeping my current car.'
      },
      {
        'title': 'Football score keeper',
        'description': 'A simple tool to help keep track of the score in a football match.',
        'url': 'https://football.sensecall.co.uk',
        'why': 'I was stood at my son\'s football match and got fed up of keeping score using the Notes app on my phone, so I built a simple tool to do it for me.'
      },
      {
        'title': 'UK Renewable Energy Map',
        'description': 'A map of current and planned renewable energy generation capacity in the UK.',
        'url': 'https://uk-renewable-energy-map.sensecall.co.uk',
        'why': 'I was interested in seeing how much renewable energy generation capacity is planned or currently in operation in the UK, but I couldn\'t find a map that showed this information so I built my own.'
      },
      {
        'title': 'Times tables game',
        'description': 'A game to help children practice maths times tables.',
        'url': 'https://times-tables-game.sensecall.co.uk',
        'why': 'While helping my son with his times tables, I couldn\'t find a game that was quick, fun and engaging so I built a simple one-page web app to do the job.'
      }
    ];

    return experiments;
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
      layouts: "_includes/layouts"
    }
  };
};