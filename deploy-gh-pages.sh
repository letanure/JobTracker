#!/bin/bash

# Deploy to GitHub Pages
# This script deploys the dist/index.html file to gh-pages branch

echo "🚀 Deploying to GitHub Pages..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a Git repository"
    exit 1
fi

# Check if dist/index.min.html exists, if not build with minification
if [ ! -f "dist/index.min.html" ]; then
    echo "📦 Building project with minification..."
    if ! node build.js --minify; then
        echo "❌ Build failed!"
        exit 1
    fi
fi

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Using temp directory: $TEMP_DIR"

# Copy dist/index.min.html to temp directory as index.html
cp dist/index.min.html "$TEMP_DIR/index.html"
echo "📦 Using minified version for deployment"

# Get the current commit hash for reference
COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)

# Switch to gh-pages branch (create if it doesn't exist)
echo "🌿 Switching to gh-pages branch..."
if git show-ref --verify --quiet refs/heads/gh-pages; then
    # Branch exists, switch to it
    git checkout gh-pages
else
    # Branch doesn't exist, create orphan branch
    git checkout --orphan gh-pages
    git rm -rf .
fi

# Copy the built file
cp "$TEMP_DIR/index.html" ./index.html

# Create a simple README for the gh-pages branch
cat > README.md << EOF
# JobTracker - GitHub Pages Deployment

This branch contains the built version of JobTracker for GitHub Pages deployment.

- **Built from**: \`main\` branch commit \`$COMMIT_HASH\`
- **Auto-generated**: $(date)
- **Source**: [View source code](../../tree/main)

## 🌐 Live Demo
[Open JobTracker](./index.html)

---
*This file is auto-generated. Do not edit manually.*
EOF

# Add and commit
git add index.html README.md
git commit -m "Deploy from main@$COMMIT_HASH

$COMMIT_MSG

Auto-deployed on $(date)
🤖 Generated with [Claude Code](https://claude.ai/code)"

echo "✅ Committed to gh-pages branch"

# Push to origin
echo "📤 Pushing to GitHub..."
if git push origin gh-pages; then
    echo "🎉 Successfully deployed to GitHub Pages!"
    echo ""
    echo "📍 Your site will be available at:"
    echo "   https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^/.]*\).*/\1.github.io\/\2/')/"
    echo ""
    echo "ℹ️  Note: It may take a few minutes for changes to appear"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

# Switch back to main branch
echo "🔄 Switching back to main branch..."
git checkout main

# Clean up
rm -rf "$TEMP_DIR"

echo "✨ Deployment complete!"