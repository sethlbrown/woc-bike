#!/usr/bin/env node

/**
 * This script converts JPG and PNG images to WebP format
 * It preserves the directory structure and keeps original files
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
      return;
    }
  }
  
  console.log(`Converting ${imagePath} to WebP`);
  try {
    execSync(`cwebp -q ${QUALITY} "${imagePath}" -o "${webpPath}"`);
  } catch (error) {
    console.error(`Error converting ${imagePath}:`, error.message);
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

// Main execution
console.log('Starting WebP conversion...');
for (const dir of IMAGE_DIRS) {
  console.log(`Processing directory: ${dir}`);
  processDirectory(dir);
}
console.log('WebP conversion complete!');