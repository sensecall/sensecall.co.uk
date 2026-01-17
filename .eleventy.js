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

  // a function allowing accepting a nunjucks filter - e.g. {{ date | customDate('MMMM yyyy') }}
  eleventyConfig.addFilter("customDate", function (date, format) {
    // if format is 'MMMM yyyy', return the date in the format 'MMMM yyyy'
    if (format === 'MMMM yyyy') {
      return new Date(date).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric'
      });
    } else if (format === 'dd MMMM yyyy') {
      return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } else if (format === 'd MMM yyyy') {
      return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } else {
      return new Date(date).toLocaleDateString('en-GB', format);
    }
  });

  // Add a filter to get the index of the current item in a collection
  eleventyConfig.addFilter("getCollectionIndex", function(collection, page) {
    return collection.findIndex(item => item.url === page.url) + 1;
  });

  // Ensure plain files like ads.txt are copied to the site root
  eleventyConfig.addPassthroughCopy("src/ads.txt");

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
        'title': 'Drawdown calculator',
        'description': 'A quick way to model how different withdrawal rates and investment returns affect pension drawdown over time.',
        'url': 'https://drawdowncalculator.sensecall.co.uk',
        'why': 'I wanted to see how long my pension might last under different scenarios, so I built a simple tool to do the maths for me.'
      },
      {
        'title': 'IR35 take-home pay calculator',
        'description': 'A quick way to calculate take-home pay for different complex IR35 scenarios.',
        'url': 'https://ir35.org',
        'why': 'I needed a fast way to work out take-home pay across tricky IR35 scenarios, so I put this together.'
      },
      {
        'title': 'IR35 contract checker',
        'description': 'A quick way to check if a contract sits inside or outside IR35.',
        'url': 'https://ir35.org',
        'why': 'I needed a fast sanity check for IR35 without wading through HMRC guidance, so I put this together.',
        'date': '2025-07-01'
      },
      {
        'title': 'Advanced Mortgage Planning Calculator',
        'description': 'A comprehensive mortgage calculator that allows you to explore different scenarios and see how different factors affect your mortgage repayments.',
        'url': 'https://themortgagetool.co.uk',
        'why': 'Another tool to scratch an itch. I was looking for a mortgage calculator that would allow me to explore different scenarios and see how future interest rates would affect my mortgage repayments. In the end I decided to spin it out into a proper website; I hope it\'s useful for others.'
      },
      {
        'title': 'Car cost comparison',
        'description': 'A tool to help compare the cost of buying a new car against the cost of keeping your current car.',
        'url': 'https://car.sensecall.co.uk',
        'why': 'I couldn\'t find a tool or spreadsheet that did a decent job of helping me compare the cost of buying a new car against the cost of keeping my current car.'
      },
      {
        'title': 'Nursery EYFS ratio planning tool',
        'description': 'A tool to help nurseries and other early years providers plan their EYFS ratios.',
        'url': 'https://nursery.sensecall.co.uk',
        'why': 'Honestly, I started this as a small tool as an alternative to using Excel, but it\'s grown into an almost fully-fledged service for early years providers. I might build a proper website for it one day.'
      },
      {
        'title': 'Football score keeper',
        'description': 'A simple tool to help keep track of the score in a football match.',
        'url': 'https://football.sensecall.co.uk',
        'why': 'I was stood at my son\'s football match and got fed up of keeping score using the Notes app on my phone, so I built a simple tool to do it for me.'
      },
      {
        'title': 'Times tables game',
        'description': 'A game to help children practice maths times tables.',
        'url': 'https://times-tables-game.sensecall.co.uk',
        'why': 'While helping my son with his times tables, I couldn\'t find a game that was quick, fun and engaging so I built a simple one-page web app to do the job.'
      },
      {
        'title': 'Energy bill calculator',
        'description': 'A quick way to estimate your yearly energy costs based on your usage.',
        'url': 'https://energybillcalculator.sensecall.co.uk',
        'why': 'I wanted to see how different tariffs and usage would affect our energy bills, so I built a tool to crunch the numbers.'
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
