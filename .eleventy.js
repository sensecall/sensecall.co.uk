let Nunjucks = require("nunjucks");

module.exports = function (eleventyConfig) {
  // Watch CSS files for changes
  eleventyConfig.setBrowserSyncConfig({
    files: './_site/css/**/*.css'
  });

  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("fonts");
  eleventyConfig.addPassthroughCopy("images");
  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

  // add nunjucks filter for showing the date in a nice format
  eleventyConfig.addFilter("niceDate", function (date) {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  });

  let nunjucksEnvironment = new Nunjucks.Environment(
    new Nunjucks.FileSystemLoader("_includes")
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
      }
    ];

    return logos;
  });

  return {
    // These are all optional (defaults are shown):
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
      layouts: "_layouts"
    }
  };
};