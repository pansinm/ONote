const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../buildResources/icon.svg');
const outputDir = path.join(__dirname, '../buildResources');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);

  // 生成主图标 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'icon.png'));
  console.log('✓ Generated icon.png (512x512)');

  // 生成托盘图标 16x16
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(outputDir, 'tray-icon.png'));
  console.log('✓ Generated tray-icon.png (16x16)');

  // 生成其他尺寸
  const sizes = [16, 32, 48, 64, 128, 256];
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch(console.error);
