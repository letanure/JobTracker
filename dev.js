#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;
const DIST_PATH = path.join(__dirname, 'dist');
const SRC_PATH = path.join(__dirname, 'src');

// MIME types
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Function to run the build
function runBuild() {
    console.log('🔨 Building...');
    const build = spawn('node', ['build.js'], { stdio: 'inherit' });
    
    build.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Build complete');
        } else {
            console.error('❌ Build failed');
        }
    });
}

// Create server
const server = http.createServer((req, res) => {
    let filePath = path.join(DIST_PATH, req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    console.log(`📄 Serving: ${req.url} (${new Date().toLocaleTimeString()})`);

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Try index.html for any route (SPA support)
                fs.readFile(path.join(DIST_PATH, 'index.html'), (error, content) => {
                    if (error) {
                        res.writeHead(404);
                        res.end('404 Not Found');
                    } else {
                        const timestamp = Date.now();
                        res.writeHead(200, { 
                            'Content-Type': 'text/html',
                            'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                            'Pragma': 'no-cache',
                            'Expires': '0',
                            'Last-Modified': new Date(timestamp).toUTCString(),
                            'ETag': `"${timestamp}"`,
                            'X-Timestamp': timestamp
                        });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            // Add strong cache control headers to prevent browser caching
            const timestamp = Date.now();
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Last-Modified': new Date(timestamp).toUTCString(),
                'ETag': `"${timestamp}"`,
                'X-Timestamp': timestamp // For debugging
            });
            res.end(content, 'utf-8');
        }
    });
});

// Watch for file changes
function watchFiles() {
    console.log('👀 Watching for changes in src/...');
    
    let buildTimeout;
    
    fs.watch(SRC_PATH, { recursive: true }, (eventType, filename) => {
        if (filename && !filename.includes('.swp') && !filename.includes('~')) {
            console.log(`📝 Changed: ${filename}`);
            
            // Debounce builds to avoid multiple rapid rebuilds
            clearTimeout(buildTimeout);
            buildTimeout = setTimeout(() => {
                runBuild();
            }, 100);
        }
    });
}

// Initial build
runBuild();

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/`);
    console.log('📁 Serving files from dist/');
    console.log('');
    console.log('Press Ctrl+C to stop');
    
    // Start watching after server is up
    watchFiles();
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...');
    server.close(() => {
        process.exit(0);
    });
});