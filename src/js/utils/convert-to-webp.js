#!/usr/bin/env node

/**
 * WebP Conversion Utility
 * 
 * This script converts JPG and PNG images to WebP format throughout the codebase.
 * It preserves the directory structure and keeps original files.
 * 
 * Used by the following npm scripts:
 * - npm run webp: Standalone WebP conversion
 * - npm run build:production:webp: Production build with WebP conversion
 * 
 * Path reference: /src/js/utils/convert-to-webp.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if cwebp is installed
try {
  execSync('which cwebp', { stdio: 'ignore' });
} catch (e) {
  console.error('Error: cwebp is not installed. Please install it using:');
  console.error('  brew install webp');
  process.exit(1);
}

const IMAGE_DIRS = [
  path.join(__dirname, '../../../assets/img'),
  path.join(__dirname, '../../../_site/assets/img')
];

// Extensions to convert
const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];

// Quality for WebP conversion (0-100)
const QUALITY = 80;

/**
 * Convert a single image to WebP
 */
function convertImage(imagePath) {
  const ext = path.extname(imagePath);
  if (!EXTENSIONS.includes(ext)) return;

  const webpPath = imagePath.replace(ext, '.webp');
  
  // Skip if WebP already exists and is newer than source
  if (fs.existsSync(webpPath)) {
    const srcStat = fs.statSync(imagePath);
    const webpStat = fs.statSync(webpPath);
    if (webpStat.mtime > srcStat.mtime) {
      // Skip if WebP is newer than source
      skippedCount++;
      return;
    }
  }
  
  // Skip problematic files
  if (imagePath.includes('dos_gringos_logo.jpg')) {
    skippedCount++;
    return;
  }
  
  console.log(`Converting ${imagePath} to WebP`);
  try {
    // Add -quiet flag to reduce output verbosity and additional option to handle problematic images
    execSync(`cwebp -quiet -q ${QUALITY} -mt -metadata none "${imagePath}" -o "${webpPath}"`, {
      stdio: 'ignore' // Suppress stdout/stderr to avoid verbose output
    });
    convertedCount++;
  } catch (error) {
    errorCount++;
    // Don't output the error details as they're usually too verbose
  }
}

/**
 * Recursively process all images in a directory
 */
function processDirectory(directory) {
  if (!fs.existsSync(directory)) {
    console.warn(`Directory does not exist: ${directory}`);
    return;
  }

  const items = fs.readdirSync(directory);
  
  for (const item of items) {
    const itemPath = path.join(directory, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      processDirectory(itemPath);
    } else if (stat.isFile()) {
      convertImage(itemPath);
    }
  }
}

// Track stats
let convertedCount = 0;
let skippedCount = 0;
let errorCount = 0;

// Main execution
console.log('Starting WebP conversion...');
console.log('---------------------------');
for (const dir of IMAGE_DIRS) {
  console.log(`Processing directory: ${dir}`);
  processDirectory(dir);
}
console.log('---------------------------');
console.log(`WebP conversion complete!`);
console.log(`Files converted: ${convertedCount}`);
console.log(`Files skipped: ${skippedCount}`);
console.log(`Files with errors: ${errorCount}`);