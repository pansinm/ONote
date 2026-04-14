const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { default: pngToIco } = require('png-to-ico');
const png2icons = require('png2icons');

const svgPath = path.join(__dirname, '../buildResources/icon.svg');
const traySvgPath = path.join(__dirname, '../buildResources/tray-icon.svg');
const outputDir = path.join(__dirname, '../buildResources');

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);
  const traySvgBuffer = fs.existsSync(traySvgPath) ? fs.readFileSync(traySvgPath) : svgBuffer;

  // 生成主图标 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(outputDir, 'icon.png'));
  console.log('✓ Generated icon.png (512x512)');

  // 生成托盘图标
  await sharp(traySvgBuffer)
    .resize(16, 16)
    .png()
    .toFile(path.join(outputDir, 'tray-icon.png'));
  console.log('✓ Generated tray-icon.png (16x16)');

  await sharp(traySvgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(outputDir, 'tray-icon@2x.png'));
  console.log('✓ Generated tray-icon@2x.png (32x32)');

  // 生成其他尺寸
  const sizes = [16, 32, 48, 64, 128, 256];
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  // 生成 .ico 文件 (Windows)
  const icoBuffer = await pngToIco([
    path.join(outputDir, 'icon-16x16.png'),
    path.join(outputDir, 'icon-32x32.png'),
    path.join(outputDir, 'icon-48x48.png'),
    path.join(outputDir, 'icon-256x256.png'),
  ]);
  fs.writeFileSync(path.join(outputDir, 'icon.ico'), icoBuffer);
  console.log('✓ Generated icon.ico');

  // 生成 .icns 文件 (macOS)
  const pngBuffer = fs.readFileSync(path.join(outputDir, 'icon.png'));
  const icnsBuffer = await png2icons.createICNS(pngBuffer, png2icons.BILINEAR, 0);
  fs.writeFileSync(path.join(outputDir, 'icon.icns'), icnsBuffer);
  console.log('✓ Generated icon.icns');

  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch(console.error);
