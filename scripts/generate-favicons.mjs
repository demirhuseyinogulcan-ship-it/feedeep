#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// feedeep — Favicon Generator
// "fd" harfleri + mor-pembe gradient + siyah zemin
// ─────────────────────────────────────────────────────────────

import sharp from "sharp";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

// ─── SVG Template ───
function createSvg(size, padding = 0) {
  const innerSize = size - padding * 2;
  // Font size relative to icon size — "fd" needs to fit nicely
  const fontSize = Math.round(innerSize * 0.48);
  const cx = size / 2;
  const cy = size / 2 + fontSize * 0.03; // minimal optical adjustment for ascender

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="35%" stop-color="#a855f7"/>
      <stop offset="65%" stop-color="#d946ef"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
    <clipPath id="roundedRect">
      <rect x="0" y="0" width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" ry="${Math.round(size * 0.18)}"/>
    </clipPath>
  </defs>
  <rect width="${size}" height="${size}" fill="#050505" clip-path="url(#roundedRect)"/>
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
        font-family="'Montserrat', 'Inter', 'Helvetica Neue', Arial, sans-serif"
        font-weight="900" font-size="${fontSize}" letter-spacing="${Math.round(fontSize * -0.04)}"
        fill="url(#grad)">fd</text>
</svg>`;
}

// Maskable icon needs more padding (safe zone = 80% of icon)
function createMaskableSvg(size) {
  const safeZone = size * 0.8;
  const padding = (size - safeZone) / 2;
  const fontSize = Math.round(safeZone * 0.48);
  const cx = size / 2;
  const cy = size / 2 + fontSize * 0.03;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="35%" stop-color="#a855f7"/>
      <stop offset="65%" stop-color="#d946ef"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="#050505"/>
  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
        font-family="'Montserrat', 'Inter', 'Helvetica Neue', Arial, sans-serif"
        font-weight="900" font-size="${fontSize}" letter-spacing="${Math.round(fontSize * -0.04)}"
        fill="url(#grad)">fd</text>
</svg>`;
}

async function generate() {
  console.log("\nfeedeep — Favicon Generator\n");

  const targets = [
    { name: "public/icon-512.png", size: 512, maskable: false },
    { name: "public/icon-192.png", size: 192, maskable: false },
    { name: "public/icon-maskable-512.png", size: 512, maskable: true },
    { name: "public/icon-maskable-192.png", size: 192, maskable: true },
    { name: "public/apple-touch-icon.png", size: 180, maskable: false },
    { name: "src/app/icon.png", size: 512, maskable: false },
    { name: "src/app/apple-icon.png", size: 180, maskable: false },
  ];

  for (const target of targets) {
    const svg = target.maskable
      ? createMaskableSvg(target.size)
      : createSvg(target.size);
    const buffer = Buffer.from(svg);
    const png = await sharp(buffer).png().toBuffer();
    const outPath = join(process.cwd(), target.name);
    await writeFile(outPath, png);
    console.log(`  ✓ ${target.name} (${target.size}x${target.size})`);
  }

  // favicon.ico — 32x32 PNG wrapped as ICO
  const faviconSvg = createSvg(32);
  const favicon32 = await sharp(Buffer.from(faviconSvg))
    .png()
    .toBuffer();

  // Simple ICO format: single 32x32 PNG image
  const ico = createIco(favicon32, 32, 32);
  await writeFile(join(process.cwd(), "src/app/favicon.ico"), ico);
  console.log("  ✓ src/app/favicon.ico (32x32)");

  console.log("\n✅ Tum faviconlar olusturuldu!\n");
}

// Minimal ICO generator for single PNG image
function createIco(pngBuffer, width, height) {
  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: ICO
  header.writeUInt16LE(1, 4); // image count: 1

  // Directory entry: 16 bytes
  const entry = Buffer.alloc(16);
  entry.writeUInt8(width >= 256 ? 0 : width, 0);
  entry.writeUInt8(height >= 256 ? 0 : height, 1);
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(pngBuffer.length, 8); // size
  entry.writeUInt32LE(6 + 16, 12); // offset (header + 1 entry)

  return Buffer.concat([header, entry, pngBuffer]);
}

generate().catch(console.error);
