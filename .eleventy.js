let Nunjucks = require("nunjucks");
const execSync = require('child_process').execSync;
const fs = require("fs");

module.exports = function (eleventyConfig) {
  const includeDrafts = ["1", "true"].includes((process.env.SHOW_DRAFTS || "").toLowerCase());
  const isDevMode =
    process.env.ELEVENTY_RUN_MODE === "serve" ||
    process.env.ELEVENTY_ENV === "development" ||
    includeDrafts ||
    process.argv.includes("--serve");

  const isDraft = (data = {}) => data.draft === true || data.status === "draft";

  const isWritingMarkdown = (data = {}) => {
    const inputPath = data.page && data.page.inputPath ? data.page.inputPath : "";
    const isWritingPath =
      inputPath.includes("/src/writing/") ||
      inputPath.startsWith("./src/writing/") ||
      inputPath.startsWith("src/writing/");
    return isWritingPath && inputPath.endsWith(".md");
  };

  const shouldExcludeWritingDraft = (data = {}) =>
    isWritingMarkdown(data) && isDraft(data) && !includeDrafts;

  // Set site URL for use in sitemap and other places
  eleventyConfig.addGlobalData("site", {
    url: "https://sensecall.co.uk",
    title: "Dan Sensecall",
    description: "Service Design & UX Consultant"
  });

  eleventyConfig.addGlobalData("isDevMode", isDevMode);

  // Typeface pairings offered on the /settings/ page. Each sets the heading and body fonts.
  // Pairings with a null query are self-hosted; the rest load from Google Fonts only when
  // a visitor picks them. className is added to <html> so main.scss can tune spacing and
  // rhythm for that pairing.
  eleventyConfig.addGlobalData("fonts", {
    default: "default",
    options: [
      {
        key: "default",
        name: "Default",
        hint: "DM Sans headings with Atkinson Hyperlegible text",
        cssFamily: "'Atkinson Hyperlegible', sans-serif",
        headingFamily: "'DM Sans', sans-serif",
        className: null,
        query: null
      },
      {
        key: "serif",
        name: "Editorial",
        hint: "Playfair Display headings with Lora text, and more generous spacing",
        cssFamily: "'Lora', Georgia, serif",
        headingFamily: "'Playfair Display', Georgia, serif",
        className: "type-serif",
        query: "family=Lora:ital,wght@0,400..700;1,400..700&family=Playfair+Display:ital,wght@0,400..800;1,400..800"
      },
      {
        key: "classic",
        name: "Classic",
        hint: "Source Serif 4 headings with Source Sans 3 text",
        cssFamily: "'Source Sans 3', sans-serif",
        headingFamily: "'Source Serif 4', Georgia, serif",
        className: "type-classic",
        query: "family=Source+Sans+3:ital,wght@0,400..700;1,400..700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..700"
      },
      {
        key: "modern",
        name: "Modern",
        hint: "Inter for headings and text, with tighter headings",
        cssFamily: "'Inter', sans-serif",
        headingFamily: "'Inter', sans-serif",
        className: "type-modern",
        query: "family=Inter:ital,opsz,wght@0,14..32,400..700;1,14..32,400..700"
      }
    ]
  });

  // Hide draft writing posts by default.
  // In local dev, set SHOW_DRAFTS=1 to include drafts.
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      if (shouldExcludeWritingDraft(data)) {
        return false;
      }
      return data.permalink;
    },
    eleventyExcludeFromCollections: (data) => {
      if (shouldExcludeWritingDraft(data)) {
        return true;
      }
      return data.eleventyExcludeFromCollections;
    }
  });

  // Watch CSS files for changes
  eleventyConfig.setBrowserSyncConfig({
    files: './_site/css/**/*.css',
    // Add ignore patterns
    ignore: ['**/styles.css'],
    callbacks: {
      ready: function(err, bs) {
        let content404 = "";
        try {
          content404 = fs.readFileSync("_site/404.html");
        } catch (e) {
          return;
        }

        bs.addMiddleware("*", (req, res) => {
          res.writeHead(404, { "Content-Type": "text/html; charset=UTF-8" });
          res.write(content404);
          res.end();
        });
      }
    }
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

  eleventyConfig.addFilter('isoDateTime', function(dateValue) {
    if (!dateValue) return '';
    return new Date(dateValue).toISOString();
  });

  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/fonts": "assets/fonts" });
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

  // Count words in rendered post content, ignoring markup
  const countWords = (content) => {
    if (!content) return 0;
    const text = String(content)
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;|&#\d+;/gi, ' ');
    const words = text.match(/[\p{L}\p{N}'’-]+/gu);
    return words ? words.length : 0;
  };

  eleventyConfig.addFilter("wordCount", countWords);

  eleventyConfig.addFilter("thousands", (value) => Number(value).toLocaleString('en-GB'));

  // Rough reading time in whole minutes, based on 200 words per minute
  eleventyConfig.addFilter("readingTime", function (content) {
    const words = countWords(content);
    if (words === 0) return 0;
    return Math.max(1, Math.round(words / 200));
  });

  // Add a filter to get the index of the current item in a collection
  eleventyConfig.addFilter("getCollectionIndex", function(collection, page) {
    return collection.findIndex(item => item.url === page.url) + 1;
  });

  const getSeriesKey = (seriesValue) =>
    typeof seriesValue === "string"
      ? seriesValue
      : seriesValue && typeof seriesValue === "object"
        ? seriesValue.key
        : null;

  const getSeriesMeta = (seriesValue) => {
    const key = getSeriesKey(seriesValue);
    if (!key) return null;

    const isSeriesObject = seriesValue && typeof seriesValue === "object";
    const postIntro = isSeriesObject
      ? (seriesValue.postIntro || seriesValue.post_intro || seriesValue.intro || null)
      : null;
    const description = isSeriesObject
      ? (seriesValue.description || seriesValue.listDescription || seriesValue.list_description || null)
      : null;
    const illustration = isSeriesObject
      ? (seriesValue.illustration || seriesValue.image || null)
      : null;
    const illustrationAlt = isSeriesObject
      ? (seriesValue.illustrationAlt || seriesValue.illustration_alt || seriesValue.imageAlt || seriesValue.image_alt || null)
      : null;

    return {
      key,
      title: isSeriesObject && seriesValue.title ? seriesValue.title : key,
      postIntro,
      description,
      illustration,
      illustrationAlt,
      url: isSeriesObject && seriesValue.url ? seriesValue.url : `/writing/series/${key}/`
    };
  };

  // Get all posts in a series (supports string or object front matter).
  // Example front matter:
  // series: "product-ownership"
  // series:
  //   key: "product-ownership"
  //   title: "Product ownership"
  eleventyConfig.addFilter("postsInSeries", function(collection = [], seriesValue) {
    const seriesKey = getSeriesKey(seriesValue);

    if (!seriesKey) return [];

    return collection
      .filter((item) => {
        const itemSeries = item?.data?.series;
        if (!itemSeries) return false;
        if (typeof itemSeries === "string") return itemSeries === seriesKey;
        return itemSeries.key === seriesKey;
      })
      .sort((a, b) => a.date - b.date);
  });

  eleventyConfig.addFilter("seriesUrl", function(seriesValue) {
    const seriesMeta = getSeriesMeta(seriesValue);
    return seriesMeta ? seriesMeta.url : null;
  });

  // Ensure plain files like ads.txt are copied to the site root
  eleventyConfig.addPassthroughCopy("src/ads.txt");

  let nunjucksEnvironment = new Nunjucks.Environment(
    new Nunjucks.FileSystemLoader("src/_includes")
  );

  eleventyConfig.setLibrary("njk", nunjucksEnvironment);

  // Writing posts are file-based, not tag-based.
  // Keep chronological order (oldest to newest) to match Eleventy's default tagged collection behavior.
  eleventyConfig.addCollection("post", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/writing/*.md")
      .filter((item) => !(isDraft(item.data) && !includeDrafts))
      .sort((a, b) => a.date - b.date);
  });

  eleventyConfig.addCollection("series", function (collectionApi) {
    const writingPosts = collectionApi
      .getFilteredByGlob("src/writing/*.md")
      .filter((item) => !(isDraft(item.data) && !includeDrafts))
      .sort((a, b) => a.date - b.date);

    const seriesMap = new Map();

    for (const post of writingPosts) {
      const seriesMeta = getSeriesMeta(post?.data?.series);
      if (!seriesMeta) continue;

      const existingSeries = seriesMap.get(seriesMeta.key) || {
        key: seriesMeta.key,
        title: seriesMeta.title,
        postIntro: seriesMeta.postIntro,
        description: seriesMeta.description,
        illustration: seriesMeta.illustration,
        illustrationAlt: seriesMeta.illustrationAlt,
        url: seriesMeta.url,
        posts: []
      };

      if ((!existingSeries.title || existingSeries.title === existingSeries.key) && seriesMeta.title) {
        existingSeries.title = seriesMeta.title;
      }

      if (!existingSeries.postIntro && seriesMeta.postIntro) {
        existingSeries.postIntro = seriesMeta.postIntro;
      }

      if (!existingSeries.description && seriesMeta.description) {
        existingSeries.description = seriesMeta.description;
      }

      if (!existingSeries.illustration && seriesMeta.illustration) {
        existingSeries.illustration = seriesMeta.illustration;
      }

      if (!existingSeries.illustrationAlt && seriesMeta.illustrationAlt) {
        existingSeries.illustrationAlt = seriesMeta.illustrationAlt;
      }

      if (seriesMeta.url && !existingSeries.url) {
        existingSeries.url = seriesMeta.url;
      }

      existingSeries.posts.push(post);
      seriesMap.set(seriesMeta.key, existingSeries);
    }

    return Array.from(seriesMap.values())
      .map((series) => ({
        ...series,
        posts: series.posts.sort((a, b) => b.date - a.date)
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
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

  eleventyConfig.addCollection("experiments", function (collectionApi) {
    let experiments = [
      {
        'title': 'Recipe Generator',
        'description': 'Find dinner ideas using leftovers and pantry ingredients you already have.',
        'url': 'https://spud.recipes',
        'why': 'I wanted an easier way to decide what to cook with what was already in the fridge and cupboards, so I built a leftovers-first recipe tool.'
      },
      {
        'title': 'Energy bill calculator',
        'description': 'Estimate your yearly energy costs based on your usage.',
        'url': 'https://energybillcalculator.sensecall.co.uk',
        'why': 'I wanted to see how different tariffs and usage would affect our energy bills, so I built a tool to crunch the numbers.'
      },
      {
        'title': 'Meal Planner Tool',
        'description': 'A flexible weekly meal planner for saving regular meals, scheduling them and printing the finished plan.',
        'url': 'https://mealplannertool.com/',
        'why': 'I wanted an easier way to plan meals for the week and keep track of the ingredients needed.'
      },
      {
        'title': 'Drawdown calculator',
        'description': 'Model how different withdrawal rates and investment returns affect pension drawdown over time.',
        'url': 'https://drawdowncalculator.sensecall.co.uk',
        'why': 'I wanted to see how long my pension might last under different scenarios, so I built a simple tool to do the maths for me.'
      },
      {
        'title': 'IR35 take-home pay calculator',
        'description': 'Calculate take-home pay for a range of complex IR35 scenarios.',
        'url': 'https://ir35.org',
        'why': 'I needed a fast way to work out take-home pay across tricky IR35 scenarios, so I put this together.'
      },
      {
        'title': 'Advanced Mortgage Planning Calculator',
        'description': 'A comprehensive mortgage calculator to help you explore different scenarios and see how various factors affect your repayments.',
        'url': 'https://themortgagetool.co.uk',
        'why': 'Another tool to scratch an itch. I was looking for a mortgage calculator that would allow me to explore different scenarios and see how future interest rates would affect my mortgage repayments. In the end I decided to spin it out into a proper website; I hope it\'s useful for others.'
      },
      {
        'title': 'Car cost comparison',
        'description': 'Compare the cost of buying a new car versus keeping your current one.',
        'url': 'https://car.sensecall.co.uk',
        'why': 'I couldn\'t find a tool or spreadsheet that did a decent job of helping me compare the cost of buying a new car against the cost of keeping my current car.'
      },
      {
        'title': 'Nursery EYFS ratio planning tool',
        'description': 'Helps nurseries and other early years providers plan their EYFS ratios.',
        'url': 'https://nursery.sensecall.co.uk',
        'why': 'Honestly, I started this as a small tool as an alternative to using Excel, but it\'s grown into an almost fully-fledged service for early years providers. I might build a proper website for it one day.'
      },
      {
        'title': 'Football score keeper',
        'description': 'Keep track of the score in a football match, simply and easily.',
        'url': 'https://football.sensecall.co.uk',
        'why': 'I was stood at my son\'s football match and got fed up of keeping score using the Notes app on my phone, so I built a simple tool to do it for me.'
      },
      {
        'title': 'Times tables game',
        'description': 'A game to help children practise their maths times tables.',
        'url': 'https://times-tables-game.sensecall.co.uk',
        'why': 'While helping my son with his times tables, I couldn\'t find a game that was quick, fun and engaging so I built a simple one-page web app to do the job.'
      },
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
