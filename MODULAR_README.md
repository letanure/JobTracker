# JobTracker - Modular Development Setup

## 📁 Project Structure

```
job-tracker-plain/
├── src/                     # Source files (modular development)
│   ├── lib/                 # Core libraries
│   │   ├── dom.js          # jQuery-style DOM utilities
│   │   ├── storage.js      # LocalStorage wrapper
│   │   └── i18n.js         # Internationalization system
│   ├── utils/              # Utility functions
│   │   ├── constants.js    # App constants and config
│   │   ├── helpers.js      # Helper functions
│   │   └── data.js         # Data migration & persistence
│   ├── components/         # UI components
│   │   ├── notes.js        # Notes system
│   │   ├── tasks.js        # Tasks system
│   │   └── table.js        # Table and job rows
│   ├── index.html          # Main HTML template
│   ├── styles.css          # Main styles
│   └── constants.css       # CSS variables
├── dist/                   # Built output files (auto-generated)
│   └── index.html          # Single HTML file with everything inlined (default)
│   # OR (when using --separate flag):
│   ├── index.html          # HTML file with external references
│   ├── styles.css          # Built CSS file
│   ├── constants.css       # Built CSS variables
│   └── script.js           # Built JavaScript file
├── build.js                # Build script (no dependencies!)
└── package.json            # NPM scripts (optional)
```

## 🚀 Quick Start

### Option 1: Using NPM Scripts (recommended)
```bash
# Build single HTML file (default - everything inlined)
npm run build

# Build separate HTML, CSS, and JS files
npm run build:separate

# Build and watch for changes (single file mode)
npm run dev

# Build and watch for changes (separate files mode)
npm run dev:separate

# Serve the built files on localhost:8000
npm run serve

# Clean build directory
npm run clean
```

### Option 2: Direct Node.js
```bash
# Build single HTML file (default)
node build.js

# Build separate files
node build.js --separate

# Build and watch for changes (single file)
node build.js --watch

# Build and watch for changes (separate files)
node build.js --watch --separate

# Help
node build.js --help
```

## 🔧 How It Works

### Build Process
1. **Zero Dependencies**: The build script uses only Node.js built-ins
2. **Two Build Modes**: 
   - **Single File** (default): Creates one HTML file with all CSS and JS inlined
   - **Separate Files**: Creates individual HTML, CSS, and JS files
3. **JavaScript Concatenation**: Combines all JS source files in the correct order
4. **CSS Inlining**: Combines and inlines CSS files into `<style>` tags
5. **File Headers**: Adds clear section markers for debugging
6. **Missing File Handling**: Gracefully skips missing files with warnings
7. **File Watching**: Optional watch mode for development (watches all file types)

### File Loading Order
```javascript
// Core libraries (order matters!)
src/lib/dom.js          // DOM utilities first
src/lib/storage.js      // Storage utilities
src/lib/i18n.js         // Translations

// Utilities and constants
src/utils/constants.js  // Constants and config
src/utils/helpers.js    // Helper functions  
src/utils/data.js       // Data utilities

// Components
src/components/notes.js // Notes system
src/components/tasks.js // Tasks system
src/components/table.js // Table components

// Main application
src/app.js              // Application logic
```

## 📝 Development Workflow

### 1. Edit Source Files
- Work in the `src/` directory
- Edit JavaScript, HTML, or CSS files as needed
- Each file is focused on a specific area
- No build tools or bundlers needed

### 2. Build and Serve
```bash
npm run dev   # Start watch mode (rebuilds on changes)
npm run serve # Serve on localhost:8000 (in another terminal)
```

### 3. Test Changes
- Open `http://localhost:8000` in browser
- Or open `dist/index.html` directly
- Changes are automatically built when any source file changes

## 🎯 Benefits

### ✅ For Development
- **Modular Structure**: Easier to find and edit code
- **Reduced Complexity**: No build tools, just simple concatenation  
- **Fast Iteration**: Instant builds with file watching
- **Zero Dependencies**: Works anywhere Node.js runs

### ✅ For Token Usage
- **Focused Reading**: Read only the file you need to modify
- **Smaller Context**: Each file is much smaller than the monolith
- **Clear Separation**: Easy to understand what each file does

### ✅ For Maintenance
- **Single Output**: Still generates one `script.js` file
- **No Breaking Changes**: HTML file unchanged
- **Backward Compatible**: Same functionality, better organization

## 📋 File Descriptions

| File | Purpose | Size | Dependencies |
|------|---------|------|--------------|
| **lib/dom.js** | jQuery-style DOM utilities and `h()` function | ~6KB | None |
| **lib/storage.js** | LocalStorage wrapper with error handling | ~1KB | None |
| **lib/i18n.js** | Translation system with EN/PT support | ~15KB | storage.js |
| **utils/constants.js** | App config, phases, priorities, demo data | ~4KB | i18n.js |
| **utils/helpers.js** | Date formatting, UI updates, utilities | ~3KB | constants.js |
| **utils/data.js** | Data migration and persistence functions | ~2KB | storage.js |
| **components/notes.js** | Notes count, modal, item components | ~8KB | All above |
| **components/tasks.js** | Tasks count, modal, item components | ~1KB* | All above |
| **components/table.js** | Table rows and job components | ~1KB* | All above |
| **app.js** | Main application initialization | ~3KB | All above |

*\*Simplified in this example - full implementation would be larger*

## 🛠️ Extending the System

### Adding New Components
1. Create file in appropriate directory
2. Add to `BUILD_CONFIG.files` in `build.js`
3. Run build script

### Adding New Languages
1. Edit `src/lib/i18n.js`
2. Add new language object to `I18n.translations`
3. Rebuild

### Modifying Build Process
1. Edit `build.js`
2. Modify `BUILD_CONFIG` object
3. Add new build steps as needed

## 🔍 Debugging

### Finding Code
- Each section is clearly marked in the built file
- Use browser dev tools to find the source section
- Edit the appropriate source file in `src/`

### Build Issues
```bash
node build.js  # Shows detailed build progress
```

### Missing Files
- Build script shows which files are missing
- Create placeholder files or remove from build config

This modular approach gives you the best of both worlds: **easy development** with organized files and **simple deployment** with a single output file!