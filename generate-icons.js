const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSVG = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="0" fill="#FDE8EC"/>
  <circle cx="256" cy="256" r="190" fill="#FACDD5"/>
  <g transform="translate(256, 265)">
    <rect x="-80" y="-20" width="160" height="60" rx="12" fill="#F5C518"/>
    <path d="M-46,-20 L-34,-55 L34,-55 L46,-20 Z" fill="#F5C518"/>
    <path d="M-38,-17 L-28,-48 L28,-48 L38,-17 Z" fill="#A8DEF0"/>
    <rect x="-18" y="-67" width="36" height="14" rx="3" fill="#6B3A1F"/>
    <text x="0" y="-55" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#E5A800">TAXI</text>
    <g transform="translate(-12, 3)">
      <rect x="0" y="0" width="6" height="6" fill="#3D2B1F"/>
      <rect x="6" y="0" width="6" height="6" fill="#F5C518"/>
      <rect x="12" y="0" width="6" height="6" fill="#3D2B1F"/>
      <rect x="18" y="0" width="6" height="6" fill="#F5C518"/>
    </g>
    <ellipse cx="-62" cy="5" rx="11" ry="9" fill="#FFE066"/>
    <ellipse cx="62" cy="5" rx="11" ry="9" fill="#FFE066"/>
    <rect x="-45" y="24" width="90" height="14" rx="6" fill="#555"/>
    <rect x="-70" y="36" width="140" height="6" rx="3" fill="#D4A800"/>
    <ellipse cx="-55" cy="44" r="15" fill="#333"/>
    <ellipse cx="-55" cy="44" r="8" fill="#666"/>
    <ellipse cx="55" cy="44" r="15" fill="#333"/>
    <ellipse cx="55" cy="44" r="8" fill="#666"/>
  </g>
</svg>`;

async function main() {
  const publicDir = path.join(__dirname, 'public');
  const appDir = path.join(__dirname, 'app');

  // Generate PNG icons in multiple sizes
  const sizes = [192, 512, 180, 32, 16];
  
  for (const size of sizes) {
    await sharp(Buffer.from(iconSVG))
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `icon-${size}x${size}.png`));
    console.log(`✅ icon-${size}x${size}.png`);
  }

  // Generate favicon.ico (as 32x32 PNG — browsers accept PNG as favicon)
  await sharp(Buffer.from(iconSVG))
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('✅ favicon.png');

  // Also overwrite app/favicon.ico with a PNG (Next.js uses this)
  await sharp(Buffer.from(iconSVG))
    .resize(48, 48)
    .png()
    .toFile(path.join(appDir, 'favicon.ico'));
  console.log('✅ app/favicon.ico (overwritten with PNG)');

  // Apple touch icon
  await sharp(Buffer.from(iconSVG))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✅ apple-touch-icon.png');

  console.log('\n🎉 Done! All icons generated.');
}

main().catch(console.error);
