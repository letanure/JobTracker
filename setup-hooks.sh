#!/bin/bash

# JobTracker Git Hooks Setup Script
# Run this script to install Git hooks for automatic building

echo "🔧 Setting up JobTracker Git hooks..."

# Check if we're in a Git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a Git repository"
    echo "   Run this script from the project root directory"
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# JobTracker Pre-commit Hook
# Automatically builds dist/index.html and includes it in the commit

echo "🏗️  Pre-commit: Building JobTracker..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is required but not installed"
    echo "   Please install Node.js to continue"
    exit 1
fi

# Check if build script exists
if [ ! -f "build.js" ]; then
    echo "❌ Error: build.js not found"
    echo "   Make sure you're in the project root directory"
    exit 1
fi

# Run the build
echo "📦 Running build script..."
if ! node build.js; then
    echo "❌ Build failed! Commit aborted."
    echo "   Please fix build errors and try again"
    exit 1
fi

# Check if dist/index.html was created
if [ ! -f "dist/index.html" ]; then
    echo "❌ Error: dist/index.html was not created"
    echo "   Build may have failed silently"
    exit 1
fi

# Add the built file to the staging area
echo "📋 Adding dist/index.html to commit..."
git add dist/index.html

# Check if there are any other dist files and add them too
if [ -f "dist/script.js" ]; then
    git add dist/script.js
fi

if [ -f "dist/styles.css" ]; then
    git add dist/styles.css
fi

if [ -f "dist/constants.css" ]; then
    git add dist/constants.css
fi

echo "✅ Build complete! dist/index.html updated and staged."
echo ""

# Optional: Show the size of the built file
if command -v stat &> /dev/null; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        SIZE=$(stat -f%z "dist/index.html")
    else
        # Linux
        SIZE=$(stat -c%s "dist/index.html")
    fi
    SIZE_KB=$((SIZE / 1024))
    echo "📏 Built file size: ${SIZE_KB}KB"
fi

exit 0
EOF

# Make the hook executable
chmod +x .git/hooks/pre-commit

echo "✅ Pre-commit hook installed successfully!"
echo ""
echo "ℹ️  What this does:"
echo "   - Automatically runs 'node build.js' before each commit"
echo "   - Adds dist/index.html (and other dist files) to the commit"
echo "   - Ensures the built version is always up-to-date"
echo ""
echo "🚀 You're all set! Your commits will now automatically include the latest build."