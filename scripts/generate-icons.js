import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a simple colored square as a placeholder icon
function createIcon(size, filename) {
  const canvas = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${size}" height="${size}" rx="${size/8}" fill="url(#grad1)"/>
  
  <!-- Share icon -->
  <g transform="translate(${size/4}, ${size/4})" scale="${size/512}">
    <!-- Arrow up -->
    <path d="M128 32 L96 64 L112 64 L112 96 L144 96 L144 64 L160 64 Z" fill="white" stroke="white" stroke-width="2"/>
    <!-- Arrow down -->
    <path d="M128 160 L96 128 L112 128 L112 96 L144 96 L144 128 L160 128 Z" fill="white" stroke="white" stroke-width="2"/>
    <!-- Central circle -->
    <circle cx="128" cy="96" r="16" fill="white"/>
  </g>
  
  <!-- Text -->
  <text x="${size/2}" y="${size*0.75}" font-family="Arial, sans-serif" font-size="${size/12}" font-weight="bold" text-anchor="middle" fill="white">S&G</text>
</svg>`;

  fs.writeFileSync(path.join(__dirname, '..', 'public', 'icons', filename), canvas);
}

// Generate all required icon sizes
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
sizes.forEach(size => {
  createIcon(size, `icon-${size}x${size}.png`);
});

console.log('Icons generated successfully!');
