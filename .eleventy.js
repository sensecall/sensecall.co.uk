let Nunjucks = require("nunjucks");
const execSync = require('child_process').execSync;
const moment = require('moment');

module.exports = function (eleventyConfig) {
  // Watch CSS files for changes
  eleventyConfig.setBrowserSyncConfig({
    files: './_site/assets/css/**/*.css'
  });

  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy({ "src/assets/images": "assets/images" });
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // add nunjucks filter for showing the date in a nice format
  eleventyConfig.addFilter("niceDate", function (date) {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  });

  // add nunjucks filter for formatting dates in a given format
  eleventyConfig.addFilter("formatDate", function (date, format) {
    return moment(date).format(format);
  });

  // Add a filter to get the index of the current item in a collection
  eleventyConfig.addFilter("getCollectionIndex", function(collection, page) {
    return collection.findIndex(item => item.url === page.url) + 1;
  });

  // add a reading time filter for njk templates
  eleventyConfig.addFilter("readingTime", function(content) {
    const wordsPerMinute = 250;
    const text = content.replace(/(<([^>]+)>)/gi, "");
    console.log(text);
    const wordCount = text.split(/\s+/g).length;
    return Math.ceil(wordCount / wordsPerMinute);
  });

  let nunjucksEnvironment = new Nunjucks.Environment(
    new Nunjucks.FileSystemLoader("src/_includes")
  );

  eleventyConfig.setLibrary("njk", nunjucksEnvironment);

  eleventyConfig.addCollection("sitemap", function (collectionApi) {
    return collectionApi.getAll().filter(item => !item.data.draft);
  });

  // collection for services and related articles
  eleventyConfig.addCollection("services", function (collectionApi) {
    // log the services collection to the console
    let services = collectionApi.getAll().filter(item => item.data.service && !item.data.draft);
    for (let service of services) {
      console.log(service.data.title);
    }
    return services;
  });

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