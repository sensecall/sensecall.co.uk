const axios = require('axios');
const cheerio = require('cheerio');

class SourceCodeAnalyzer {
  constructor() {
    this.axios = axios.create({
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SiteHero/1.0; +https://sitehero.dev)'
      }
    });
  }

  async fetchSourceCode(url) {
    try {
      const response = await this.axios.get(url);
      return {
        raw: response.data,
        parsed: this.parseHTML(response.data),
        status: response.status,
        headers: response.headers
      };
    } catch (error) {
      console.error('Error fetching source code:', error);
      throw error;
    }
  }

  parseHTML(html) {
    const $ = cheerio.load(html);
    
    return {
      title: $('title').text(),
      meta: this.getMetaTags($),
      headings: this.getHeadings($),
      links: this.getLinks($),
      images: this.getImages($),
      mainContent: this.getMainContent($)
    };
  }

  getMetaTags($) {
    const metaTags = {};
    $('meta').each((_, element) => {
      const name = $(element).attr('name') || $(element).attr('property');
      const content = $(element).attr('content');
      if (name && content) {
        metaTags[name] = content;
      }
    });
    return metaTags;
  }

  getHeadings($) {
    return {
      h1: $('h1').map((_, el) => $(el).text()).get(),
      h2: $('h2').map((_, el) => $(el).text()).get(),
      h3: $('h3').map((_, el) => $(el).text()).get()
    };
  }

  getLinks($) {
    return $('a').map((_, el) => ({
      text: $(el).text(),
      href: $(el).attr('href'),
      isExternal: this.isExternalLink($(el).attr('href'))
    })).get();
  }

  getImages($) {
    return $('img').map((_, el) => ({
      src: $(el).attr('src'),
      alt: $(el).attr('alt'),
      hasAlt: $(el).attr('alt') !== undefined
    })).get();
  }

  getMainContent($) {
    // Try to find main content area using common selectors
    const mainSelectors = ['main', 'article', '#main', '#content', '.main-content'];
    for (const selector of mainSelectors) {
      const content = $(selector).text();
      if (content) return content;
    }
    return $('body').text();
  }

  isExternalLink(href) {
    if (!href) return false;
    return href.startsWith('http') || href.startsWith('//');
  }
}

module.exports = { SourceCodeAnalyzer }; 