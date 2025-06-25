#!/usr/bin/env node

/**
 * Simple build script to concatenate modular JavaScript files
 * No dependencies required - uses only Node.js built-ins
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Import minification tools
let terser, htmlMinifier, csso, purgecss;
try {
  terser = require('terser');
  htmlMinifier = require('html-minifier-terser');
  csso = require('csso');
  purgecss = require('@fullhuman/postcss-purgecss').default;
} catch (error) {
  console.log('⚠️  Minification packages not installed. Run: npm install --save-dev terser html-minifier-terser csso-cli @fullhuman/postcss-purgecss');
}

// Check command line arguments
const args = process.argv.slice(2);
const enableDeadCSS = args.includes('--analyze-css') || args.includes('--dead-css');
const generateReport = args.includes('--report');

// Build configuration
const BUILD_CONFIG = {
  // Output files
  outputFile: 'dist/script.js',
  singleFileOutput: 'dist/index.html',
  
  // File order for concatenation (order matters!)
  files: [
    // Core libraries
    'src/lib/dom.js',
    'src/lib/storage.js', 
    'src/lib/i18n/en.js',
    'src/lib/i18n/pt.js',
    'src/lib/i18n.js',
    
    // Utilities and constants
    'src/utils/constants.js',
    'src/utils/seed-data.js',
    'src/utils/helpers.js',
    'src/utils/data.js',
    
    // Components
    'src/components/dialogs.js',
    'src/components/notes.js',
    // Task modules (must be loaded before main tasks.js)
    'src/components/tasks/task-count.js',
    'src/components/tasks/task-item.js',
    'src/components/tasks/task-modal.js',
    'src/components/tasks/task-operations.js',
    'src/components/tasks.js',
    'src/components/contacts.js',
    'src/components/form-fields.js',
    'src/components/language-switcher.js',
    'src/components/tabs.js',
    'src/components/kanban.js',
    'src/components/tasks-board.js',
    'src/components/calendar-view.js',
    'src/components/contacts-view.js',
    'src/components/table.js',
    'src/components/dashboard.js',
    'src/components/resume.js',
    
    // Application modules
    'src/app/stats.js',
    'src/app/events.js',
    'src/app/editing.js',
    'src/app/init.js'
  ],
  
  // CSS files to inline
  cssFiles: [
    'src/styles/base.css',
    'src/styles/layout.css',
    // Component CSS files (in order)
    'src/styles/components/utilities.css',
    'src/styles/components/buttons.css',
    'src/styles/components/forms.css',
    'src/styles/components/contacts.css',
    'src/styles/components/dropdowns.css',
    'src/styles/components/modals.css',
    'src/styles/components/badges.css',
    'src/styles/components/language-switcher.css',
    'src/styles/components/tabs.css',
    'src/styles/components/kanban.css',
    'src/styles/components/tasks.css',
    'src/styles/components/calendar.css',
    'src/styles/components/resume.css',
    'src/styles/components/cv.css',
    'src/styles/components/dialogs.css',
    // Remaining CSS files
    'src/styles/table.css',
    'src/styles/dashboard.css'
  ],
  
  // HTML template
  htmlTemplate: 'src/index.html',
  
  // Files to copy directly to dist (for separate file mode)
  copyFiles: [
    { src: 'src/index.html', dest: 'dist/index.html' },
    { src: 'src/styles.css', dest: 'dist/styles.css' }
  ],
  
  // Header comment for the built file
  header: `// ============================================================================
// JobTracker - Built from modular source files
// Generated: ${new Date().toISOString()}
// ============================================================================

`
};

/**
 * Check if a file exists
 */
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

/**
 * Read file content with error handling
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error(`❌ Error reading file ${filePath}:`, err.message);
    return null;
  }
}

/**
 * Write content to file with error handling
 */
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (err) {
    console.error(`❌ Error writing file ${filePath}:`, err.message);
    return false;
  }
}

/**
 * Copy file with error handling
 */
function copyFile(srcPath, destPath) {
  try {
    // Ensure destination directory exists
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    fs.copyFileSync(srcPath, destPath);
    return true;
  } catch (err) {
    console.error(`❌ Error copying file ${srcPath} to ${destPath}:`, err.message);
    return false;
  }
}

/**
 * Advanced JavaScript minification using Terser (async)
 */
async function minifyJavaScript(code) {
  if (!terser) {
    console.log('⚠️  Terser not available, returning unminified code');
    return code;
  }

  try {
    const result = await terser.minify(code, {
      compress: {
        dead_code: true,
        drop_console: false, // Keep console.log for debugging
        drop_debugger: true,
        keep_fnames: false,
        passes: 2
      },
      mangle: {
        toplevel: false,
        keep_fnames: false
      },
      format: {
        comments: false
      }
    });

    if (result.error) {
      console.error('⚠️  Terser minification failed:', result.error.message);
      return code; // Return original code if minification fails
    }

    return result.code || code;
  } catch (error) {
    console.error('⚠️  JavaScript minification error:', error.message);
    return code; // Return original code if minification fails
  }
}

/**
 * Minify CSS custom properties (variables)
 */
function minifyCSSVariables(css) {
  const varMap = new Map();
  let counter = 0;
  
  // Generate short variable names
  const getShortName = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let name = '';
    let num = counter++;
    
    do {
      name = chars[num % chars.length] + name;
      num = Math.floor(num / chars.length);
    } while (num > 0);
    
    return `--${name}`;
  };
  
  // Find all CSS variables declarations
  const varRegex = /--([\w-]+)/g;
  const foundVars = new Set();
  
  let match;
  while ((match = varRegex.exec(css)) !== null) {
    foundVars.add(match[0]);
  }
  
  // Create mapping for variables (skip very short ones)
  Array.from(foundVars)
    .filter(varName => varName.length > 5) // Only minify vars longer than 5 chars
    .sort((a, b) => b.length - a.length) // Sort by length to replace longer ones first
    .forEach(varName => {
      varMap.set(varName, getShortName());
    });
  
  // Replace all occurrences
  let minifiedCSS = css;
  varMap.forEach((shortName, longName) => {
    // CSS variables don't use word boundaries, so we need to be more careful
    // Match the variable in property declarations and var() functions
    const escapedName = longName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|[^\\w-])${escapedName}(?=[^\\w-]|$)`, 'g');
    minifiedCSS = minifiedCSS.replace(regex, (match, prefix) => prefix + shortName);
  });
  
  console.log(`   📐 CSS variables: ${varMap.size} minified`);
  
  return minifiedCSS;
}

/**
 * Analyze and remove dead CSS using PurgeCSS
 */
async function analyzeDeadCSS(css, htmlContent, jsContent) {
  if (!purgecss) {
    console.log('⚠️  PurgeCSS not available for dead CSS analysis');
    return { cleaned: css, removed: [] };
  }

  try {
    const postcss = require('postcss');
    
    // Configure PurgeCSS
    const purgeConfig = {
      content: [
        {
          raw: htmlContent,
          extension: 'html'
        },
        {
          raw: jsContent,
          extension: 'js'
        }
      ],
      css: [
        {
          raw: css
        }
      ],
      defaultExtractor: content => {
        // Extract class names, IDs, and tag names
        const classMatches = content.match(/[A-Za-z0-9_-]+/g) || [];
        return classMatches;
      },
      safelist: [
        // Always keep these classes/patterns
        /^btn/,
        /^material-symbols/,
        /^icon-/,
        /^hidden$/,
        /^visible$/,
        /^active$/,
        /^error$/,
        /^success$/,
        /^warning$/,
        /^info$/,
        // Dashboard stat colors
        /^stat-/,
        /^dashboard-/,
        // Priority classes
        /^priority-/,
        // Status classes 
        /^status-/,
        // CSS variables (they might be referenced in JS)
        /^--/,
        // Pseudo-classes and states
        'hover',
        'focus',
        'active',
        'disabled',
        'checked',
        'selected'
      ]
    };

    // Run PurgeCSS
    const purgeResult = await postcss([purgecss(purgeConfig)]).process(css, { from: undefined });
    
    // Analyze what was removed (simplified)
    const originalRules = css.match(/\.[A-Za-z0-9_-]+[^{]*\{[^}]*\}/g) || [];
    const cleanedRules = purgeResult.css.match(/\.[A-Za-z0-9_-]+[^{]*\{[^}]*\}/g) || [];
    
    const removedEstimate = originalRules.length - cleanedRules.length;
    
    return {
      cleaned: purgeResult.css,
      originalSize: css.length,
      cleanedSize: purgeResult.css.length,
      removedRules: removedEstimate,
      savings: ((css.length - purgeResult.css.length) / css.length * 100).toFixed(1)
    };
  } catch (error) {
    console.error('⚠️  PurgeCSS analysis error:', error.message);
    return { cleaned: css, removed: [] };
  }
}

/**
 * Generate detailed dead CSS report
 */
function generateDeadCSSReport(originalCSS, analysis) {
  const report = `DEAD CSS ANALYSIS REPORT
Generated: ${new Date().toISOString()}
========================================

SUMMARY:
- Original size: ${(analysis.originalSize / 1024).toFixed(2)} KB
- Cleaned size: ${(analysis.cleanedSize / 1024).toFixed(2)} KB
- Savings: ${analysis.savings}%
- Estimated removed rules: ${analysis.removedRules}

ANALYSIS:
This report shows CSS that was automatically removed by PurgeCSS.
The removed CSS may include:
- Unused utility classes
- Legacy styles
- Framework CSS not being used
- Dead code from refactoring

RECOMMENDATIONS:
1. Review your CSS files for unused classes
2. Consider removing unused CSS manually from source files
3. Use more specific CSS selectors
4. Consider a CSS-in-JS approach for dynamic styles

NEXT STEPS:
1. Run: npm run build --analyze-css --report
2. Review this report
3. Manually remove identified dead CSS from source files
4. Test thoroughly after removal

========================================
Generated by JobTracker Build System
`;

  return report;
}

/**
 * Advanced CSS minification using CSSO
 */
function minifyCSS(css, minifyVars = true) {
  if (!csso) {
    // Fallback to basic minification
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Compress whitespace
      .replace(/;\s+/g, ';') // Remove space after semicolons
      .replace(/\{\s+/g, '{') // Remove space after opening braces
      .replace(/\s+\}/g, '}') // Remove space before closing braces
      .trim();
  }

  try {
    // First use CSSO for general minification
    const result = csso.minify(css, {
      restructure: true,
      forceMediaMerge: true,
      comments: false
    });
    
    let minifiedCSS = result.css;
    
    // Then minify CSS variables if requested
    if (minifyVars) {
      minifiedCSS = minifyCSSVariables(minifiedCSS);
    }

    return minifiedCSS;
  } catch (error) {
    console.error('⚠️  CSS minification error:', error.message);
    return css; // Return original CSS if minification fails
  }
}

/**
 * Advanced HTML minification using html-minifier-terser (async)
 */
async function minifyHTML(html) {
  if (!htmlMinifier) {
    console.log('⚠️  html-minifier-terser not available, returning unminified HTML');
    return html;
  }

  try {
    const minified = await htmlMinifier.minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      minifyCSS: true,  // Enable CSS minification
      minifyJS: true,   // Enable JS minification
      useShortDoctype: true,
      removeEmptyAttributes: true,
      caseSensitive: true,
      keepClosingSlash: true,
      conservativeCollapse: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      sortAttributes: true,
      sortClassName: true
    });
    
    return minified;
  } catch (error) {
    console.error('⚠️  HTML minification error:', error.message);
    return html; // Return original HTML if minification fails
  }
}

/**
 * Simple HTML minification (fallback)
 */
function simpleMinifyHTML(html) {
  // Split HTML into parts to avoid minifying script content
  const scriptRegex = /(<script[^>]*>)([\s\S]*?)(<\/script>)/gi;
  const parts = [];
  let lastIndex = 0;
  let match;

  // Find all script tags and their content
  while ((match = scriptRegex.exec(html)) !== null) {
    // Add HTML before script
    if (match.index > lastIndex) {
      parts.push({
        type: 'html',
        content: html.slice(lastIndex, match.index)
      });
    }
    
    // Add script parts separately
    parts.push({
      type: 'script-open',
      content: match[1]
    });
    parts.push({
      type: 'script-content', 
      content: match[2]
    });
    parts.push({
      type: 'script-close',
      content: match[3]
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining HTML
  if (lastIndex < html.length) {
    parts.push({
      type: 'html',
      content: html.slice(lastIndex)
    });
  }

  // Process each part appropriately
  return parts.map(part => {
    if (part.type === 'html' || part.type === 'script-open' || part.type === 'script-close') {
      // Apply minification to HTML parts only
      return part.content
        // Remove comments (but keep the build comment at the top)
        .replace(/<!--(?!.*JobTracker)[\s\S]*?-->/g, '')
        // Remove extra whitespace between tags (but preserve content)
        .replace(/>\s+</g, '><')
        // Remove leading/trailing whitespace from lines
        .replace(/^\s+/gm, '')
        .replace(/\s+$/gm, '')
        // Remove empty lines
        .replace(/\n\s*\n/g, '\n');
    } else {
      // Keep script content unchanged
      return part.content;
    }
  }).join('').trim();
}

/**
 * Replace SEO placeholders with translated content
 * Uses translations from separate language files
 */
function replaceSEOPlaceholders(html, language = 'en') {
  // Load translation files directly
  const enPath = path.join(__dirname, 'src/lib/i18n/en.js');
  const ptPath = path.join(__dirname, 'src/lib/i18n/pt.js');
  
  const enContent = readFile(enPath);
  const ptContent = readFile(ptPath);
  
  if (!enContent || !ptContent) {
    console.error('❌ Could not load translation files for SEO');
    return html;
  }
  
  let translations;
  try {
    // Extract translation constants from files
    const enMatch = enContent.match(/const EN_TRANSLATIONS\s*=\s*(\{[\s\S]*\});/);
    const ptMatch = ptContent.match(/const PT_TRANSLATIONS\s*=\s*(\{[\s\S]*\});/);
    
    if (!enMatch || !ptMatch) {
      console.error('❌ Could not parse translation constants');
      return html;
    }
    
    // Evaluate the translation objects
    let EN_TRANSLATIONS, PT_TRANSLATIONS;
    eval(`EN_TRANSLATIONS = ${enMatch[1]}`);
    eval(`PT_TRANSLATIONS = ${ptMatch[1]}`);
    
    translations = {
      en: EN_TRANSLATIONS,
      pt: PT_TRANSLATIONS
    };
  } catch (error) {
    console.error('❌ Error parsing translations:', error.message);
    return html;
  }
  
  const langTranslations = translations[language] || translations.en;
  if (!langTranslations || !langTranslations.seo) {
    console.error(`❌ SEO translations not found for language: ${language}`);
    return html;
  }
  
  const seo = langTranslations.seo;
  const ogLocale = language === 'pt' ? 'pt_BR' : 'en_US';
  const baseUrl = 'https://letanure.github.io/job-tracker-plain/';
  const canonicalUrl = language === 'en' ? baseUrl : `${baseUrl}?lang=${language}`;
  
  // Generate hreflang links
  const hreflangLinks = generateHreflangLinks(baseUrl, translations);

  return html
    .replace(/\{\{LANG\}\}/g, language)
    .replace(/\{\{SEO_TITLE\}\}/g, seo.title)
    .replace(/\{\{SEO_DESCRIPTION\}\}/g, seo.description)
    .replace(/\{\{SEO_KEYWORDS\}\}/g, seo.keywords)
    .replace(/\{\{SEO_AUTHOR\}\}/g, seo.author)
    .replace(/\{\{SEO_OG_TITLE\}\}/g, seo.ogTitle)
    .replace(/\{\{SEO_OG_DESCRIPTION\}\}/g, seo.ogDescription)
    .replace(/\{\{SEO_TWITTER_TITLE\}\}/g, seo.twitterTitle)
    .replace(/\{\{SEO_TWITTER_DESCRIPTION\}\}/g, seo.twitterDescription)
    .replace(/\{\{OG_LOCALE\}\}/g, ogLocale)
    .replace(/\{\{CANONICAL_URL\}\}/g, canonicalUrl)
    .replace(/\{\{HREFLANG_LINKS\}\}/g, hreflangLinks);
}

/**
 * Generate hreflang links for all available languages
 */
function generateHreflangLinks(baseUrl, translations) {
  const languages = Object.keys(translations);
  const links = [];
  
  // Add hreflang links for each language
  languages.forEach(lang => {
    const href = lang === 'en' ? baseUrl : `${baseUrl}?lang=${lang}`;
    links.push(`    <link rel="alternate" hreflang="${lang}" href="${href}">`);
  });
  
  // Add x-default hreflang (English as default)
  links.push(`    <link rel="alternate" hreflang="x-default" href="${baseUrl}">`);
  
  return links.join('\n');
}

/**
 * Analyze compression potential (without creating files)
 */
function analyzeCompression(content) {
  try {
    const originalSizeKB = (content.length / 1024).toFixed(2);
    
    // Analyze gzip compression
    const gzipContent = zlib.gzipSync(content, { level: 9 });
    const gzipSizeKB = (gzipContent.length / 1024).toFixed(2);
    const gzipSavings = (((content.length - gzipContent.length) / content.length) * 100).toFixed(1);
    
    console.log(`📄 Current size: ${originalSizeKB} KB`);
    console.log(`🗜️  Gzip potential: ${gzipSizeKB} KB (${gzipSavings}% smaller)`);
    
    // Analyze brotli compression if available
    if (zlib.brotliCompressSync) {
      const brotliContent = zlib.brotliCompressSync(content, {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          [zlib.constants.BROTLI_PARAM_SIZE_HINT]: content.length
        }
      });
      const brotliSizeKB = (brotliContent.length / 1024).toFixed(2);
      const brotliSavings = (((content.length - brotliContent.length) / content.length) * 100).toFixed(1);
      console.log(`🔧 Brotli potential: ${brotliSizeKB} KB (${brotliSavings}% smaller)`);
    }

  } catch (error) {
    console.error('⚠️  Compression analysis failed:', error.message);
  }
}

/**
 * Build minified single file (now the default build output)
 */
async function buildMinifiedSingle() {
  console.log('🗜️  Building optimized single file...\n');
  
  // Build JavaScript and CSS
  const jsResult = buildJavaScript();
  const cssResult = buildCSS();
  
  // Read HTML template
  if (!fileExists(BUILD_CONFIG.htmlTemplate)) {
    console.error(`❌ HTML template not found: ${BUILD_CONFIG.htmlTemplate}`);
    return false;
  }
  
  let htmlContent = readFile(BUILD_CONFIG.htmlTemplate);
  if (htmlContent === null) {
    return false;
  }
  
  // Replace SEO placeholders with English content (default)
  htmlContent = replaceSEOPlaceholders(htmlContent, 'en');
  
  // Remove external CSS links and script tags
  htmlContent = htmlContent.replace(/<link rel="stylesheet" href="[^"]*">/g, '');
  htmlContent = htmlContent.replace(/<script src="[^"]*"><\/script>/g, '');
  
  // Add minimal build metadata
  const buildTimestamp = new Date().toISOString();
  const cacheVersion = Date.now();
  const buildComment = `<!-- 
============================================================================
JobTracker - Single File Build
Generated: ${buildTimestamp}
Cache Version: ${cacheVersion}
============================================================================
-->`;
  
  // Insert minified CSS (advanced minification)
  console.log('🎨 Minifying CSS...');
  
  let cssToMinify = cssResult.content;
  
  // Analyze and remove dead CSS if enabled
  if (enableDeadCSS) {
    console.log('🔍 Analyzing dead CSS...');
    const deadCSSAnalysis = await analyzeDeadCSS(cssResult.content, htmlContent, jsResult.content);
    if (deadCSSAnalysis.savings > 0) {
      console.log(`   🗑️  Dead CSS removed: ${deadCSSAnalysis.removedRules} rules (~${deadCSSAnalysis.savings}% reduction)`);
      console.log(`   📐 Before: ${(deadCSSAnalysis.originalSize / 1024).toFixed(2)} KB → After: ${(deadCSSAnalysis.cleanedSize / 1024).toFixed(2)} KB`);
      cssToMinify = deadCSSAnalysis.cleaned;
      
      // Generate detailed report if requested
      if (generateReport) {
        const reportPath = 'dead-css-report.txt';
        const report = generateDeadCSSReport(cssResult.content, deadCSSAnalysis);
        if (writeFile(reportPath, report)) {
          console.log(`   📋 Dead CSS report: ${reportPath}`);
        }
      }
    } else {
      console.log('   ✅ No significant dead CSS found');
    }
  } else {
    console.log('   ℹ️  Dead CSS analysis disabled. Use --analyze-css to enable.');
  }
  
  // Then minify the CSS
  const minifiedCSS = minifyCSS(cssToMinify);
  console.log(`   📐 Final CSS: ${(cssResult.content.length / 1024).toFixed(2)} KB → ${(minifiedCSS.length / 1024).toFixed(2)} KB`);
  const cssBlock = `<style>${minifiedCSS}</style>`;
  htmlContent = htmlContent.replace('</head>', `${cssBlock}</head>`);
  
  // Insert minified JavaScript (advanced minification)
  console.log('📦 Minifying JavaScript...');
  const minifiedJS = await minifyJavaScript(jsResult.content);
  console.log(`   📐 JS: ${(jsResult.content.length / 1024).toFixed(2)} KB → ${(minifiedJS.length / 1024).toFixed(2)} KB`);
  const jsBlock = `<script>${minifiedJS}</script>`;
  htmlContent = htmlContent.replace('</body>', `${jsBlock}</body>`);
  
  // Add build comment and minify HTML
  htmlContent = buildComment + htmlContent;
  console.log('🗜️  Minifying HTML...');
  
  // Use advanced HTML minification with packages
  htmlContent = await minifyHTML(htmlContent);
  
  const output = BUILD_CONFIG.singleFileOutput; // This is 'dist/index.html'
  
  if (writeFile(output, htmlContent)) {
    console.log(`🎉 Minified build complete!`);
    console.log(`📦 Output: ${output}`);
    
    // Show file size
    const stats = fs.statSync(output);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`📏 Size: ${sizeKB} KB`);

    // Create compressed versions for reference (but don't clutter the main directory)
    console.log('\n📊 Compression Analysis:');
    analyzeCompression(htmlContent);
    
    return true;
  }
  
  return false;
}

/**
 * Build minified version for deployment (extra minified version)
 */
function buildMinified() {
  console.log('🗜️  Building extra optimized version...\n');
  
  // Build JavaScript and CSS
  const jsResult = buildJavaScript();
  const cssResult = buildCSS();
  
  // Read HTML template
  if (!fileExists(BUILD_CONFIG.htmlTemplate)) {
    console.error(`❌ HTML template not found: ${BUILD_CONFIG.htmlTemplate}`);
    return false;
  }
  
  let htmlContent = readFile(BUILD_CONFIG.htmlTemplate);
  if (htmlContent === null) {
    return false;
  }
  
  // Replace SEO placeholders with English content (default)
  htmlContent = replaceSEOPlaceholders(htmlContent, 'en');
  
  // Remove external CSS links and script tags
  htmlContent = htmlContent.replace(/<link rel="stylesheet" href="[^"]*">/g, '');
  htmlContent = htmlContent.replace(/<script src="[^"]*"><\/script>/g, '');
  
  // Add minimal build metadata
  const buildTimestamp = new Date().toISOString();
  const cacheVersion = Date.now();
  const buildComment = `<!--
Generated: ${buildTimestamp}
Cache Version: ${cacheVersion}
-->`;
  
  // Insert minified CSS (advanced minification)
  console.log('🎨 Minifying CSS...');
  console.log('   ℹ️  Dead CSS analysis available in main build only');
  const minifiedCSS = minifyCSS(cssResult.content);
  const cssBlock = `<style>${minifiedCSS}</style>`;
  htmlContent = htmlContent.replace('</head>', `${cssBlock}</head>`);
  
  // Insert minified JavaScript (advanced minification)
  console.log('📦 Minifying JavaScript...');
  const minifiedJS = minifyJavaScript(jsResult.content);
  const jsBlock = `<script>${minifiedJS}</script>`;
  htmlContent = htmlContent.replace('</body>', `${jsBlock}</body>`);
  
  // Add build comment and minify HTML
  htmlContent = buildComment + htmlContent;
  console.log('🗜️  Minifying HTML...');
  
  // Use simple HTML minification for now (advanced minification has async issues)
  htmlContent = simpleMinifyHTML(htmlContent);
  
  const minifiedOutput = 'dist/index.min.html';
  
  if (writeFile(minifiedOutput, htmlContent)) {
    console.log(`🎉 Extra minified build complete!`);
    console.log(`📦 Output: ${minifiedOutput}`);
    
    // Show file size
    const stats = fs.statSync(minifiedOutput);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`📏 Size: ${sizeKB} KB`);

    // Create compressed versions for reference (but don't clutter the main directory)
    console.log('\n📊 Compression Analysis:');
    analyzeCompression(htmlContent);
    
    return true;
  }
  
  return false;
}

/**
 * Build JavaScript content from source files
 */
function buildJavaScript() {
  const contents = [];
  let successCount = 0;
  let missingFiles = [];
  
  // Add header with build timestamp
  const buildTimestamp = new Date().toISOString();
  const header = `// ============================================================================
// JobTracker - Built from modular source files
// Generated: ${buildTimestamp}
// ============================================================================

// Show build info in console
console.log("JobTracker - Built at: ${buildTimestamp}");

`;
  contents.push(header);
  
  // Process each JavaScript file
  for (const file of BUILD_CONFIG.files) {
    if (!fileExists(file)) {
      missingFiles.push(file);
      continue;
    }
    
    const content = readFile(file);
    if (content === null) {
      continue;
    }
    
    // Add file separator comment
    contents.push(`
// ============================================================================
// ${file.toUpperCase()}
// ============================================================================

`);
    
    // Add file content
    contents.push(content);
    contents.push('\n');
    
    successCount++;
  }
  
  return {
    content: contents.join(''),
    successCount,
    missingFiles
  };
}

/**
 * Build CSS content from source files
 */
function buildCSS() {
  const contents = [];
  let successCount = 0;
  let missingFiles = [];
  
  // Process each CSS file
  for (const file of BUILD_CONFIG.cssFiles) {
    if (!fileExists(file)) {
      missingFiles.push(file);
      continue;
    }
    
    const content = readFile(file);
    if (content === null) {
      continue;
    }
    
    // Add file separator comment
    contents.push(`
/* ============================================================================ */
/* ${file.toUpperCase()} */
/* ============================================================================ */

`);
    
    // Add file content
    contents.push(content);
    contents.push('\n');
    
    successCount++;
  }
  
  return {
    content: contents.join(''),
    successCount,
    missingFiles
  };
}

/**
 * Build single HTML file with inlined CSS and JavaScript
 */
function buildSingleFile() {
  console.log('🔧 Building single HTML file...\n');
  
  // Read HTML template
  if (!fileExists(BUILD_CONFIG.htmlTemplate)) {
    console.error(`❌ HTML template not found: ${BUILD_CONFIG.htmlTemplate}`);
    return false;
  }
  
  let htmlContent = readFile(BUILD_CONFIG.htmlTemplate);
  if (htmlContent === null) {
    return false;
  }
  
  // Build JavaScript
  console.log('📦 Building JavaScript...');
  const jsResult = buildJavaScript();
  console.log(`   ✅ JS files processed: ${jsResult.successCount}/${BUILD_CONFIG.files.length}`);
  
  // Build CSS
  console.log('🎨 Building CSS...');
  const cssResult = buildCSS();
  console.log(`   ✅ CSS files processed: ${cssResult.successCount}/${BUILD_CONFIG.cssFiles.length}`);
  
  // Replace SEO placeholders with English content (default)
  htmlContent = replaceSEOPlaceholders(htmlContent, 'en');
  
  // Remove external CSS links and replace with inline styles
  htmlContent = htmlContent.replace(
    /<link rel="stylesheet" href="[^"]*">/g,
    ''
  );
  
  // Remove external script tag and replace with inline script
  htmlContent = htmlContent.replace(
    /<script src="[^"]*"><\/script>/g,
    ''
  );
  
  // Generate version info for cache busting
  const buildDate = new Date();
  const buildTimestamp = buildDate.toISOString();
  const cacheVersion = buildDate.getTime(); // Unix timestamp for cache busting
  
  // Add build comment with version info
  const buildComment = `<!-- 
============================================================================
JobTracker - Single File Build
Generated: ${buildTimestamp}
Cache Version: ${cacheVersion}
============================================================================
-->
`;
  
  // Insert version meta tag and CSS into head
  const versionMeta = `    <meta name="build-version" content="${cacheVersion}">
    <meta name="build-date" content="${buildTimestamp}">`;
  
  const cssBlock = `    <style>
${cssResult.content}    </style>`;
  
  htmlContent = htmlContent.replace('</head>', `${versionMeta}\n${cssBlock}\n</head>`);
  
  // Insert JavaScript before closing body tag with version info
  const jsBlock = `    <script>
// Build version for cache busting
window.BUILD_VERSION = '${cacheVersion}';
window.BUILD_DATE = '${buildTimestamp}';

${jsResult.content}    </script>`;
  
  htmlContent = htmlContent.replace('</body>', `${jsBlock}\n</body>`);
  
  // Add build comment at the top
  htmlContent = buildComment + htmlContent;
  
  // Write the single file
  if (writeFile(BUILD_CONFIG.singleFileOutput, htmlContent)) {
    console.log(`\n🎉 Single file build complete!`);
    console.log(`📦 Output: ${BUILD_CONFIG.singleFileOutput}`);
    
    // Show any missing files
    const allMissingFiles = [...jsResult.missingFiles, ...cssResult.missingFiles];
    if (allMissingFiles.length > 0) {
      console.log(`⚠️  Missing files: ${allMissingFiles.join(', ')}`);
    }
    
    // Show file size
    const stats = fs.statSync(BUILD_CONFIG.singleFileOutput);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`📏 Size: ${sizeKB} KB`);
    
    return true;
  }
  
  return false;
}

/**
 * Main build function - builds minified single HTML file by default
 */
async function build(separateFiles = false, unminified = false) {
  console.log('🏗️  Building JobTracker...\n');
  
  // Ensure dist directory exists
  const distDir = path.dirname(BUILD_CONFIG.singleFileOutput);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log(`📁 Created directory: ${distDir}`);
  }
  
  if (separateFiles) {
    return buildSeparateFiles();
  } else if (unminified) {
    return buildSingleFile(); // Build unminified single file version for development
  } else {
    return await buildMinifiedSingle(); // Build minified single file version by default
  }
}

/**
 * Build separate files (original behavior)
 */
function buildSeparateFiles() {
  console.log('📦 Building separate files...\n');
  
  const contents = [];
  let successCount = 0;
  let missingFiles = [];
  
  // Add header
  contents.push(BUILD_CONFIG.header);
  
  // Process each file
  for (const file of BUILD_CONFIG.files) {
    console.log(`📁 Processing: ${file}`);
    
    if (!fileExists(file)) {
      console.log(`   ⚠️  File not found - skipping`);
      missingFiles.push(file);
      continue;
    }
    
    const content = readFile(file);
    if (content === null) {
      continue;
    }
    
    // Add file separator comment
    contents.push(`
// ============================================================================
// ${file.toUpperCase()}
// ============================================================================

`);
    
    // Add file content
    contents.push(content);
    contents.push('\n');
    
    successCount++;
    console.log(`   ✅ Added to build`);
  }
  
  // Write the combined file
  const finalContent = contents.join('');
  
  if (writeFile(BUILD_CONFIG.outputFile, finalContent)) {
    console.log(`\n📋 Copying additional files...`);
    
    // Copy HTML and CSS files
    let copySuccessCount = 0;
    let copyFailedFiles = [];
    
    for (const copyItem of BUILD_CONFIG.copyFiles) {
      console.log(`📁 Copying: ${copyItem.src} → ${copyItem.dest}`);
      
      if (!fileExists(copyItem.src)) {
        console.log(`   ⚠️  Source file not found - skipping`);
        copyFailedFiles.push(copyItem.src);
        continue;
      }
      
      if (copyFile(copyItem.src, copyItem.dest)) {
        console.log(`   ✅ Copied successfully`);
        copySuccessCount++;
      } else {
        copyFailedFiles.push(copyItem.src);
      }
    }
    
    console.log(`\n🎉 Separate files build complete!`);
    console.log(`📦 JavaScript: ${BUILD_CONFIG.outputFile}`);
    console.log(`📊 JS files processed: ${successCount}/${BUILD_CONFIG.files.length}`);
    console.log(`📋 Files copied: ${copySuccessCount}/${BUILD_CONFIG.copyFiles.length}`);
    
    if (missingFiles.length > 0) {
      console.log(`⚠️  Missing JS files: ${missingFiles.join(', ')}`);
      console.log(`   These files were skipped - create them to include in build`);
    }
    
    if (copyFailedFiles.length > 0) {
      console.log(`⚠️  Failed to copy: ${copyFailedFiles.join(', ')}`);
    }
    
    // Show file size
    const stats = fs.statSync(BUILD_CONFIG.outputFile);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`📏 JS Size: ${sizeKB} KB`);
    
    return true;
  } else {
    console.log('\n❌ Build failed!');
    return false;
  }
}

/**
 * Watch mode (simple file watching)
 */
async function watch(separateFiles = false, unminified = false) {
  console.log('👀 Watching for changes...\n');
  
  const watchedJSFiles = BUILD_CONFIG.files.filter(file => fileExists(file));
  const watchedCSSFiles = BUILD_CONFIG.cssFiles.filter(file => fileExists(file));
  const watchedHTMLFiles = [BUILD_CONFIG.htmlTemplate].filter(file => fileExists(file));
  
  const allWatchedFiles = [...watchedJSFiles, ...watchedCSSFiles, ...watchedHTMLFiles];
  
  // Initial build
  await build(separateFiles, unminified);
  
  // Watch all files for changes
  allWatchedFiles.forEach(file => {
    fs.watchFile(file, { interval: 1000 }, async () => {
      console.log(`\n📝 ${file} changed - rebuilding...`);
      await build(separateFiles, unminified);
    });
  });
  
  console.log(`\nWatching ${allWatchedFiles.length} files. Press Ctrl+C to stop.`);
  console.log(`Mode: ${separateFiles ? 'Separate files' : unminified ? 'Single HTML file (unminified)' : 'Single HTML file (minified)'}`);
}

// CLI handling

const separateFiles = args.includes('--separate') || args.includes('-s');
const watchMode = args.includes('--watch') || args.includes('-w');
const minified = args.includes('--minify') || args.includes('-m');
const unminified = args.includes('--dev') || args.includes('-d');
const showHelp = args.includes('--help') || args.includes('-h');

// Main async function to handle CLI
(async () => {
  if (showHelp) {
    console.log(`
JobTracker Build Script

Usage:
  node build.js                    Build minified single HTML file (default for production)
  node build.js --dev              Build unminified single HTML file (for development)
  node build.js --separate         Build separate HTML, CSS, and JS files
  node build.js --minify           Build regular + extra minified version
  node build.js --watch            Build and watch for changes (minified mode)
  node build.js --analyze-css      Build with dead CSS analysis and removal
  node build.js --analyze-css --report  Build with dead CSS analysis + generate report
  node build.js --watch --dev      Build and watch for changes (unminified mode)
  node build.js --watch --separate Build and watch for changes (separate files mode)
  node build.js --help             Show this help

Outputs:
  Minified file:  ${BUILD_CONFIG.singleFileOutput} (default)
  Extra minified: dist/index.min.html
  Separate files: ${BUILD_CONFIG.outputFile} + HTML/CSS files
`);
  } else if (watchMode) {
    await watch(separateFiles, unminified);
  } else if (minified) {
    // Build both regular and extra minified versions
    await build(separateFiles, unminified);
    await buildMinified();
  } else {
    await build(separateFiles, unminified);
  }
})().catch(error => {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
});