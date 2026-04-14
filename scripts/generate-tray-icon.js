#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateTrayIcon() {
  const svgPath = path.join(__dirname, '../buildResources/tray-icon.svg');
  const pngFallbackPath = path.join(__dirname, '../buildResources/icon.png');
  const outputPath = path.join(__dirname, '../buildResources/tray-icon.png');
  const output2xPath = path.join(__dirname, '../buildResources/tray-icon@2x.png');

  try {
    const input = fs.existsSync(svgPath) ? fs.readFileSync(svgPath) : pngFallbackPath;

    await sharp(input)
      .resize(16, 16, { fit: 'contain' })
      .png()
      .toFile(outputPath);

    await sharp(input)
      .resize(32, 32, { fit: 'contain' })
      .png()
      .toFile(output2xPath);

    console.log('✅ Tray icons generated:', outputPath, output2xPath);
  } catch (error) {
    console.error('❌ Failed to generate tray icons:', error);
    process.exit(1);
  }
}

generateTrayIcon();
