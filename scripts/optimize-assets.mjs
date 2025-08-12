#!/usr/bin/env node

/**
 * Asset Optimization Script
 * Batch optimize images in the attached_assets directory
 */

// Note: This script should be run from the project root
// For now, this is a placeholder - actual optimization should be done through the admin UI
import path from 'path';
import fs from 'fs/promises';

async function main() {
  console.log('🖼️  Starting asset optimization...\n');

  try {
    const inputDir = 'attached_assets';
    const outputDir = 'attached_assets/optimized';

    // Check if input directory exists
    try {
      await fs.access(inputDir);
    } catch (error) {
      console.error('❌ Input directory not found:', inputDir);
      process.exit(1);
    }

    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    // Get all image files
    const files = await fs.readdir(inputDir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file) && 
      !file.startsWith('.') // Skip hidden files
    );

    if (imageFiles.length === 0) {
      console.log('ℹ️  No image files found to optimize');
      return;
    }

    console.log(`📁 Found ${imageFiles.length} image files to optimize\n`);

    let processed = 0;
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    const errors = [];

    for (const file of imageFiles) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, 
        file.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp')
      );

      try {
        console.log(`🔄 Processing: ${file}`);
        
        const result = await ImageOptimizer.optimizeImage(inputPath, outputPath, {
          quality: 80,
          format: 'webp',
          progressive: true
        });

        totalOriginalSize += result.originalSize;
        totalOptimizedSize += result.optimizedSize;
        processed++;

        console.log(`✅ ${file}: ${result.savings.toFixed(1)}% savings (${formatFileSize(result.originalSize)} → ${formatFileSize(result.optimizedSize)})`);
      } catch (error) {
        console.error(`❌ Failed to optimize ${file}:`, error.message);
        errors.push({ file, error: error.message });
      }
    }

    // Summary
    console.log('\n📊 Optimization Summary:');
    console.log(`   Processed: ${processed}/${imageFiles.length} files`);
    
    if (totalOriginalSize > 0) {
      const totalSavings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100;
      console.log(`   Total savings: ${totalSavings.toFixed(1)}%`);
      console.log(`   Size reduction: ${formatFileSize(totalOriginalSize)} → ${formatFileSize(totalOptimizedSize)}`);
      console.log(`   Saved: ${formatFileSize(totalOriginalSize - totalOptimizedSize)}`);
    }

    if (errors.length > 0) {
      console.log(`\n⚠️  ${errors.length} errors occurred:`);
      errors.forEach(({ file, error }) => {
        console.log(`   ${file}: ${error}`);
      });
    }

    console.log('\n🎉 Asset optimization complete!');

  } catch (error) {
    console.error('❌ Asset optimization failed:', error.message);
    process.exit(1);
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Run the script
main().catch(console.error);