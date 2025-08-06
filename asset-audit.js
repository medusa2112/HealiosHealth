#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Find all asset imports in the codebase
function findAssetUsage() {
  const usedAssets = new Set();
  const clientDir = './client';
  
  function scanDirectory(dir) {
    try {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDirectory(filePath);
        } else if (file.match(/\.(tsx?|jsx?|css|html)$/)) {
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // Find @assets imports
            const assetMatches = content.match(/@assets\/[^\s'"`;]+/g) || [];
            assetMatches.forEach(match => {
              const assetPath = match.replace('@assets/', '');
              usedAssets.add(assetPath);
            });
            
            // Find /assets/ references
            const publicAssetMatches = content.match(/\/assets\/[^\s'"`;)]+/g) || [];
            publicAssetMatches.forEach(match => {
              const assetPath = match.replace('/assets/', '');
              usedAssets.add(assetPath);
            });
          } catch (e) {
            console.log(`Error reading ${filePath}: ${e.message}`);
          }
        }
      }
    } catch (e) {
      console.log(`Error scanning ${dir}: ${e.message}`);
    }
  }
  
  scanDirectory(clientDir);
  return usedAssets;
}

// Get all files in attached_assets
function getAllAssets() {
  const allAssets = new Set();
  
  function scanAssets(dir, relativePath = '') {
    try {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        const relativeFilePath = relativePath ? `${relativePath}/${file}` : file;
        
        if (stat.isDirectory()) {
          scanAssets(filePath, relativeFilePath);
        } else {
          allAssets.add(relativeFilePath);
        }
      }
    } catch (e) {
      console.log(`Error scanning assets ${dir}: ${e.message}`);
    }
  }
  
  scanAssets('./attached_assets');
  return allAssets;
}

// Main audit
console.log('🔍 Scanning for asset usage...\n');

const usedAssets = findAssetUsage();
const allAssets = getAllAssets();

console.log(`📊 Asset Usage Summary:`);
console.log(`Total assets in attached_assets: ${allAssets.size}`);
console.log(`Assets actually used in code: ${usedAssets.size}`);
console.log(`Unused assets: ${allAssets.size - usedAssets.size}\n`);

// Show used assets
console.log('✅ Used Assets:');
Array.from(usedAssets).sort().forEach(asset => {
  console.log(`  - ${asset}`);
});

console.log('\n❌ Unused Assets (potential candidates for removal):');
const unusedAssets = Array.from(allAssets).filter(asset => !usedAssets.has(asset));

// Categorize unused assets
const categories = {
  images: [],
  videos: [],
  text: [],
  other: []
};

unusedAssets.forEach(asset => {
  if (asset.match(/\.(png|jpg|jpeg|webp|svg)$/i)) {
    categories.images.push(asset);
  } else if (asset.match(/\.(mp4|mov|webm|avi)$/i)) {
    categories.videos.push(asset);
  } else if (asset.match(/\.(txt|md)$/i)) {
    categories.text.push(asset);
  } else {
    categories.other.push(asset);
  }
});

console.log(`\n📸 Unused Images (${categories.images.length}):`);
categories.images.slice(0, 10).forEach(asset => console.log(`  - ${asset}`));
if (categories.images.length > 10) {
  console.log(`  ... and ${categories.images.length - 10} more`);
}

console.log(`\n🎥 Unused Videos (${categories.videos.length}):`);
categories.videos.forEach(asset => console.log(`  - ${asset}`));

console.log(`\n📄 Unused Text Files (${categories.text.length}):`);
categories.text.slice(0, 5).forEach(asset => console.log(`  - ${asset}`));
if (categories.text.length > 5) {
  console.log(`  ... and ${categories.text.length - 5} more`);
}

// Calculate potential savings
function getFileSizeSync(filePath) {
  try {
    return fs.statSync(filePath).size;
  } catch {
    return 0;
  }
}

let totalUnusedSize = 0;
unusedAssets.forEach(asset => {
  totalUnusedSize += getFileSizeSync(`./attached_assets/${asset}`);
});

console.log(`\n💾 Potential space savings: ${(totalUnusedSize / (1024 * 1024)).toFixed(1)} MB`);

// Save detailed report
const report = {
  summary: {
    totalAssets: allAssets.size,
    usedAssets: usedAssets.size,
    unusedAssets: allAssets.size - usedAssets.size,
    potentialSavingsMB: (totalUnusedSize / (1024 * 1024)).toFixed(1)
  },
  usedAssets: Array.from(usedAssets).sort(),
  unusedAssets: {
    images: categories.images,
    videos: categories.videos,
    text: categories.text,
    other: categories.other
  }
};

fs.writeFileSync('asset-audit-report.json', JSON.stringify(report, null, 2));
console.log('\n📋 Detailed report saved to asset-audit-report.json');