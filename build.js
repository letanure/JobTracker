#!/usr/bin/env node

/**
 * Simple build script to concatenate modular JavaScript files
 * No dependencies required - uses only Node.js built-ins
 */

const fs = require('fs');
const path = require('path');

// Build configuration
const BUILD_CONFIG = {
  // Output file
  outputFile: 'dist/script.js',
  
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
  
  // Files to copy directly to dist
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
 * Main build function
 */
function build() {
  console.log('🏗️  Building JobTracker...\n');
  
  // Ensure dist directory exists
  const distDir = path.dirname(BUILD_CONFIG.outputFile);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log(`📁 Created directory: ${distDir}`);
  }
  
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
    
    console.log(`\n🎉 Build complete!`);
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
    
  } else {
    console.log('\n❌ Build failed!');
    process.exit(1);
  }
}

/**
 * Watch mode (simple file watching)
 */
function watch() {
  console.log('👀 Watching for changes...\n');
  
  const watchedJSFiles = BUILD_CONFIG.files.filter(file => fileExists(file));
  const watchedCopyFiles = BUILD_CONFIG.copyFiles
    .map(item => item.src)
    .filter(file => fileExists(file));
  
  const allWatchedFiles = [...watchedJSFiles, ...watchedCopyFiles];
  
  // Initial build
  build();
  
  // Watch JS files for changes
  watchedJSFiles.forEach(file => {
    fs.watchFile(file, { interval: 1000 }, () => {
      console.log(`\n📝 ${file} changed - rebuilding...`);
      build();
    });
  });
  
  // Watch copy files for changes
  watchedCopyFiles.forEach(file => {
    fs.watchFile(file, { interval: 1000 }, () => {
      console.log(`\n📝 ${file} changed - rebuilding...`);
      build();
    });
  });
  
  console.log(`\nWatching ${allWatchedFiles.length} files. Press Ctrl+C to stop.`);
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes('--watch') || args.includes('-w')) {
  watch();
} else if (args.includes('--help') || args.includes('-h')) {
  console.log(`
JobTracker Build Script

Usage:
  node build.js              Build once
  node build.js --watch      Build and watch for changes
  node build.js --help       Show this help

Output: ${BUILD_CONFIG.outputFile}
`);
} else {
  build();
}