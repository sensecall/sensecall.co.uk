const Assessment = require('../models/Assessment');
const { generateLighthouseReport } = require('./lighthouseService');
const { generateReportPreview } = require('./claudeService');
const { SourceCodeAnalyzer } = require('./sourceCodeService');

class ReportCompiler {
  constructor(assessmentId) {
    this.assessmentId = assessmentId;
    this.sections = {};
    this.sourceAnalyzer = new SourceCodeAnalyzer();
  }

  async initialize() {
    this.assessment = await Assessment.findById(this.assessmentId);
    if (!this.assessment) {
      throw new Error('Assessment not found');
    }
  }

  /* STEPS:
  1. Compile basic info - websiteUrl, dateAssessed, status
  2. Compile screenshots - screenshots array
  3. Compile source code - raw, analysis, stats
  4. Compile lighthouse results - scores, recommendations
  5. Compile AI analysis - designAnalysis, uxRecommendations, contentSuggestions
  6. Compile accessibility report - score, issues, recommendations
  7. Compile SEO analysis - score, issues, recommendations
  */

  async compileSections() {
    try {
      await Promise.all([
        this.compileBasicInfo(),
        this.compileScreenshots(),
        this.compileSourceCode(),
        this.compileLighthouseResults(),
        this.compileAIAnalysis(),
        this.compileAccessibilityReport(),
        this.compileSEOAnalysis()
      ]);

      return this.sections;
    } catch (error) {
      console.error('Error compiling report sections:', error);
      throw error;
    }
  }

  async compileBasicInfo() {
    this.sections.basicInfo = {
      websiteUrl: this.assessment.websiteUrl,
      dateAssessed: this.assessment.created,
      status: this.assessment.status
    };
  }

  async compileScreenshots() {
    this.sections.screenshots = this.assessment.screenshots || [];
  }

  async compileSourceCode() {
    try {
      const sourceData = await this.sourceAnalyzer.fetchSourceCode(this.assessment.websiteUrl);
      
      this.sections.sourceCode = {
        raw: sourceData.raw,
        analysis: {
          meta: sourceData.parsed.meta,
          headings: sourceData.parsed.headings,
          links: sourceData.parsed.links,
          images: sourceData.parsed.images
        },
        stats: {
          totalLinks: sourceData.parsed.links.length,
          externalLinks: sourceData.parsed.links.filter(l => l.isExternal).length,
          totalImages: sourceData.parsed.images.length,
          imagesWithoutAlt: sourceData.parsed.images.filter(img => !img.hasAlt).length
        }
      };
    } catch (error) {
      console.error('Error analyzing source code:', error);
      this.sections.sourceCode = {
        error: error.message
      };
    }
  }

  async compileLighthouseResults() {
    // Stub for now - will integrate with Lighthouse service
    this.sections.performance = {
      scores: {
        performance: null,
        accessibility: null,
        bestPractices: null,
        seo: null
      },
      recommendations: []
    };
  }

  async compileAIAnalysis() {
    // Stub for Claude analysis
    this.sections.aiAnalysis = {
      designAnalysis: null,
      uxRecommendations: null,
      contentSuggestions: null
    };
  }

  async compileAccessibilityReport() {
    // Stub for accessibility checks
    this.sections.accessibility = {
      score: null,
      issues: [],
      recommendations: []
    };
  }

  async compileSEOAnalysis() {
    // Stub for SEO analysis
    this.sections.seo = {
      score: null,
      issues: [],
      recommendations: []
    };
  }
}

async function generateFullReport(assessmentId) {
  const compiler = new ReportCompiler(assessmentId);
  await compiler.initialize();
  return compiler.compileSections();
}

module.exports = {
  ReportCompiler,
  generateFullReport
}; 