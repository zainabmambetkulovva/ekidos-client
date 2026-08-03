const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconSVG = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#FDE8EC"/>
  <circle cx="256" cy="256" r="190" fill="#FACDD5"/>
  
  <!-- White taxi car - side view like admin/driver icon -->
  <g transform="translate(256, 265)">
    <!-- Car body - white -->
    <rect x="-120" y="-30" width="240" height="70" rx="15" fill="#FFFFFF"/>
    
    <!-- Car roof -->
    <path d="M-50,-30 L-30,-70 L70,-70 L90,-30 Z" fill="#FFFFFF"/>
    
    <!-- Windows (red tint like admin icon) -->
    <path d="M-40,-28 L-25,-62 L20,-62 L20,-28 Z" fill="#E85555"/>
    <path d="M25,-28 L25,-62 L62,-62 L80,-28 Z" fill="#E85555"/>
    
    <!-- TAXI sign on top -->
    <rect x="-5" y="-82" width="50" height="16" rx="3" fill="#F5C518"/>
    <text x="20" y="-70" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#333">TAXI</text>
    
    <!-- Door line -->
    <line x1="22" y1="-28" x2="22" y2="35" stroke="#ddd" stroke-width="1.5"/>
    
    <!-- Wheels -->
    <circle cx="-70" cy="45" r="22" fill="#333"/>
    <circle cx="-70" cy="45" r="12" fill="#666"/>
    <circle cx="-70" cy="45" r="5" fill="#999"/>
    <circle cx="80" cy="45" r="22" fill="#333"/>
    <circle cx="80" cy="45" r="12" fill="#666"/>
    <circle cx="80" cy="45" r="5" fill="#999"/>
    
    <!-- Headlight -->
    <ellipse cx="120" cy="10" rx="5" ry="10" fill="#FFE066"/>
    <!-- Taillight -->
    <ellipse cx="-120" cy="10" rx="4" ry="8" fill="#E85555"/>
    
    <!-- EKIDOS text -->
    <text x="0" y="15" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#E85555">EKIDOS</text>
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
