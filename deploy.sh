#!/bin/bash

# Deployment script for Healios Health
echo "Starting deployment build..."

# Set Node.js environment
export NODE_ENV=production
export PORT=5000
export REPLIT_NODEJS_PACKAGE_LAYER=1

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building application..."
npm run build

# Verify build
if [ -f "dist/index.js" ]; then
    echo "✅ Build successful - dist/index.js created"
    echo "✅ Application ready for deployment"
    
    # Test production start (optional)
    echo "Testing production server start..."
    timeout 10s npm run start || echo "Server test completed"
else
    echo "❌ Build failed - dist/index.js not found"
    exit 1
fi

echo "🚀 Ready to deploy with: npm run start"