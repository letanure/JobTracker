#!/usr/bin/env node

/**
 * Simple build script to concatenate modular JavaScript files
 * No dependencies required - uses only Node.js built-ins
 */

const fs = require('fs');
const path = require('path');

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
    'src/lib/i18n.js',
    
    // Utilities and constants
    'src/utils/constants.js',
    'src/utils/helpers.js',
    'src/utils/data.js',
    
    // Components
    'src/components/notes.js',
    'src/components/tasks.js', 
    'src/components/table.js',
    
    // Main application
    'src/app.js'
  ],
  
  // CSS files to inline
  cssFiles: [
    'src/constants.css',
    'src/styles.css'
  ],
  
  // HTML template
  htmlTemplate: 'src/index.html',
  
  // Files to copy directly to dist (for separate file mode)
  copyFiles: [
    { src: 'src/index.html', dest: 'dist/index.html' },
    { src: 'src/styles.css', dest: 'dist/styles.css' },
    { src: 'src/constants.css', dest: 'dist/constants.css' }
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
 * Simple HTML minification
 */
function minifyHTML(html) {
  return html
    // Remove comments (but keep the build comment at the top)
    .replace(/<!--(?!.*JobTracker)[\s\S]*?-->/g, '')
    // Remove extra whitespace between tags (but preserve content)
    .replace(/>\s+</g, '><')
    // Remove leading/trailing whitespace from lines
    .replace(/^\s+/gm, '')
    .replace(/\s+$/gm, '')
    // Remove empty lines
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * Build minified version for deployment
 */
function buildMinified() {
  console.log('🗜️  Building minified version for deployment...\n');
  
  // First build the regular version
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
  
  // Remove external CSS links and script tags
  htmlContent = htmlContent.replace(/<link rel="stylesheet" href="[^"]*">/g, '');
  htmlContent = htmlContent.replace(/<script src="[^"]*"><\/script>/g, '');
  
  // Add minified build comment
  const buildComment = `<!-- JobTracker v${new Date().toISOString().split('T')[0]} - Minified for deployment -->`;
  
  // Insert minified CSS (basic minification)
  const minifiedCSS = cssResult.content
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Compress whitespace
    .replace(/;\s+/g, ';') // Remove space after semicolons
    .replace(/\{\s+/g, '{') // Remove space after opening braces
    .replace(/\s+\}/g, '}') // Remove space before closing braces
    .trim();
  const cssBlock = `<style>${minifiedCSS}</style>`;
  htmlContent = htmlContent.replace('</head>', `${cssBlock}</head>`);
  
  // Insert minified JavaScript (basic minification)
  const minifiedJS = jsResult.content
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*$/gm, '') // Remove line comments
    .replace(/\s+/g, ' ') // Compress whitespace
    .replace(/;\s+/g, ';') // Remove space after semicolons
    .replace(/\{\s+/g, '{') // Remove space after opening braces
    .replace(/\s+\}/g, '}') // Remove space before closing braces
    .trim();
  const jsBlock = `<script>${minifiedJS}</script>`;
  htmlContent = htmlContent.replace('</body>', `${jsBlock}</body>`);
  
  // Add build comment and minify
  htmlContent = buildComment + htmlContent;
  htmlContent = minifyHTML(htmlContent);
  
  const minifiedOutput = 'dist/index.min.html';
  
  if (writeFile(minifiedOutput, htmlContent)) {
    console.log(`🎉 Minified build complete!`);
    console.log(`📦 Output: ${minifiedOutput}`);
    
    // Show file sizes comparison
    const originalStats = fs.statSync(BUILD_CONFIG.singleFileOutput);
    const minifiedStats = fs.statSync(minifiedOutput);
    const originalSizeKB = (originalStats.size / 1024).toFixed(2);
    const minifiedSizeKB = (minifiedStats.size / 1024).toFixed(2);
    const savings = (((originalStats.size - minifiedStats.size) / originalStats.size) * 100).toFixed(1);
    
    console.log(`📏 Original size: ${originalSizeKB} KB`);
    console.log(`📏 Minified size: ${minifiedSizeKB} KB`);
    console.log(`💾 Space saved: ${savings}%`);
    
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
  
  // Add header
  contents.push(BUILD_CONFIG.header);
  
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
  
  // Add build comment
  const buildComment = `<!-- 
============================================================================
JobTracker - Single File Build
Generated: ${new Date().toISOString()}
============================================================================
-->
`;
  
  // Insert CSS into head
  const cssBlock = `    <style>
${cssResult.content}    </style>`;
  
  htmlContent = htmlContent.replace('</head>', `${cssBlock}\n</head>`);
  
  // Insert JavaScript before closing body tag
  const jsBlock = `    <script>
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
 * Main build function - builds single HTML file by default
 */
function build(separateFiles = false) {
  console.log('🏗️  Building JobTracker...\n');
  
  // Ensure dist directory exists
  const distDir = path.dirname(BUILD_CONFIG.singleFileOutput);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log(`📁 Created directory: ${distDir}`);
  }
  
  if (separateFiles) {
    return buildSeparateFiles();
  } else {
    return buildSingleFile();
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
function watch(separateFiles = false) {
  console.log('👀 Watching for changes...\n');
  
  const watchedJSFiles = BUILD_CONFIG.files.filter(file => fileExists(file));
  const watchedCSSFiles = BUILD_CONFIG.cssFiles.filter(file => fileExists(file));
  const watchedHTMLFiles = [BUILD_CONFIG.htmlTemplate].filter(file => fileExists(file));
  
  const allWatchedFiles = [...watchedJSFiles, ...watchedCSSFiles, ...watchedHTMLFiles];
  
  // Initial build
  build(separateFiles);
  
  // Watch all files for changes
  allWatchedFiles.forEach(file => {
    fs.watchFile(file, { interval: 1000 }, () => {
      console.log(`\n📝 ${file} changed - rebuilding...`);
      build(separateFiles);
    });
  });
  
  console.log(`\nWatching ${allWatchedFiles.length} files. Press Ctrl+C to stop.`);
  console.log(`Mode: ${separateFiles ? 'Separate files' : 'Single HTML file'}`);
}

// CLI handling
const args = process.argv.slice(2);

const separateFiles = args.includes('--separate') || args.includes('-s');
const watchMode = args.includes('--watch') || args.includes('-w');
const minified = args.includes('--minify') || args.includes('-m');
const showHelp = args.includes('--help') || args.includes('-h');

if (showHelp) {
  console.log(`
JobTracker Build Script

Usage:
  node build.js                    Build single HTML file (default)
  node build.js --separate         Build separate HTML, CSS, and JS files
  node build.js --minify           Build regular + minified version
  node build.js --watch            Build and watch for changes (single file mode)
  node build.js --watch --separate Build and watch for changes (separate files mode)
  node build.js --help             Show this help

Outputs:
  Single file:    ${BUILD_CONFIG.singleFileOutput}
  Minified file:  dist/index.min.html
  Separate files: ${BUILD_CONFIG.outputFile} + HTML/CSS files
`);
} else if (watchMode) {
  watch(separateFiles);
} else if (minified) {
  // Build both regular and minified versions
  build(separateFiles);
  buildMinified();
} else {
  build(separateFiles);
}