#!/usr/bin/env node
/**
 * Security Script: Remove Console.log Statements
 * This script removes all console.log/error statements from production code
 * to prevent sensitive data leakage
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Directories to process
const directories = [
  'server/**/*.ts',
  'server/**/*.js',
  'client/src/**/*.ts',
  'client/src/**/*.tsx',
  'lib/**/*.ts',
  'shared/**/*.ts'
];

// Files to exclude
const excludePatterns = [
  '**/node_modules/**',
  '**/.cache/**',
  '**/dist/**',
  '**/build/**',
  '**/*.test.*',
  '**/*.spec.*',
  '**/vite.ts' // Keep vite logging for debugging
];

let totalRemoved = 0;
let filesModified = 0;

function removeConsoleLogs(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Pattern to match console.log, console.error, console.warn, console.info, console.debug
    // Handles multi-line statements
    const consolePattern = /console\.(log|error|warn|info|debug)\([^)]*\);?(\s*\/\/.*)?/g;
    const multilinePattern = /console\.(log|error|warn|info|debug)\s*\([^)]*\n([^)]*\n)*[^)]*\);?/gm;
    
    // Remove single-line console statements
    content = content.replace(consolePattern, (match) => {
      // Keep error logging in catch blocks for debugging
      if (match.includes('console.error') && content.includes('catch')) {
        return '// ' + match; // Comment out instead of removing
      }
      totalRemoved++;
      return ''; // Remove completely
    });
    
    // Remove multi-line console statements
    content = content.replace(multilinePattern, (match) => {
      totalRemoved++;
      return '';
    });
    
    // Clean up empty lines left behind
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      console.log(`✓ Cleaned: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

console.log('=================================');
console.log('Console.log Removal Script');
console.log('=================================\n');

// Process each directory pattern
directories.forEach(pattern => {
  const files = glob.sync(pattern, { 
    ignore: excludePatterns,
    nodir: true 
  });
  
  console.log(`Processing ${files.length} files in ${pattern}...`);
  
  files.forEach(file => {
    removeConsoleLogs(file);
  });
});

console.log('\n=================================');
console.log('Summary:');
console.log(`Files modified: ${filesModified}`);
console.log(`Console statements removed: ${totalRemoved}`);
console.log('=================================');

if (filesModified > 0) {
  console.log('\n⚠️  IMPORTANT: Review the changes and test your application');
  console.log('Some console.error statements in catch blocks were commented out');
  console.log('You may want to replace them with proper logging');
}