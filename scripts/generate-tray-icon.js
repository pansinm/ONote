#!/usr/bin/env node

const sharp = require('sharp');
const path = require('path');

async function generateTrayIcon() {
  const inputPath = path.join(__dirname, '../buildResources/icon.png');
  const outputPath = path.join(__dirname, '../buildResources/tray-icon.png');

  try {
    await sharp(inputPath)
      .grayscale()
      .resize(16, 16, { fit: 'cover' })
      .png()
      .toFile(outputPath);

    console.log('✅ Tray icon generated:', outputPath);
  } catch (error) {
    console.error('❌ Failed to generate tray icon:', error);
    process.exit(1);
  }
}

generateTrayIcon();
