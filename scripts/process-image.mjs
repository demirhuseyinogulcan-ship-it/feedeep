#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// AI Rehber — Görsel İşleme Scripti
// Inbox'tan al → WebP'ye dönüştür → Optimize et → Hedef klasöre taşı
//
// Kullanım:
//   node scripts/process-image.mjs <hedef-klasor> <seo-slug> [--caption "alt text"]
//
// Örnekler:
//   node scripts/process-image.mjs haberler anthropic-claude-code-sizinti
//   node scripts/process-image.mjs yazilar ai-is-hayati --caption "Yapay zeka ofis ortamında"
//
// Inbox'ta birden fazla dosya varsa ilkini alır.
// ─────────────────────────────────────────────────────────────

import sharp from "sharp";
import { readdir, mkdir, unlink, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const INBOX = "public/images/inbox";
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".tiff"]);

// ─── Config ───
const MAX_WIDTH = 1200;
const QUALITY = 80;
const THUMB_WIDTH = 256;

// ─── Args ───
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error(`
╔══════════════════════════════════════════════╗
║   AI Rehber — Görsel İşleme                 ║
╚══════════════════════════════════════════════╝

Kullanım:
  node scripts/process-image.mjs <hedef-klasor> <seo-slug> [--caption "alt text"]

Hedef klasörler: haberler, yazilar, rehberler

Örnek:
  node scripts/process-image.mjs haberler anthropic-claude-code-sizinti
`);
  process.exit(1);
}

const targetFolder = args[0]; // haberler, yazilar, etc.
const seoSlug = args[1];
const captionIdx = args.indexOf("--caption");
const caption = captionIdx !== -1 ? args[captionIdx + 1] : null;

const validFolders = ["haberler", "yazilar", "rehberler"];
if (!validFolders.includes(targetFolder)) {
  console.error(`Hata: Geçersiz klasör "${targetFolder}". Geçerli: ${validFolders.join(", ")}`);
  process.exit(1);
}

// ─── Find image in inbox ───
const inboxFiles = (await readdir(INBOX)).filter((f) =>
  IMAGE_EXTS.has(extname(f).toLowerCase())
);

if (inboxFiles.length === 0) {
  console.error("Hata: Inbox'ta görsel bulunamadı. Önce public/images/inbox/ klasörüne bir görsel bırakın.");
  process.exit(1);
}

const sourceFile = inboxFiles[0];
const sourcePath = join(INBOX, sourceFile);
const sourceStats = await stat(sourcePath);
const sourceSizeMB = (sourceStats.size / (1024 * 1024)).toFixed(2);

console.log(`\n📸 Kaynak: ${sourceFile} (${sourceSizeMB} MB)`);

// ─── Process ───
const destDir = join("public/images", targetFolder);
await mkdir(destDir, { recursive: true });

const destName = `${seoSlug}.webp`;
const destPath = join(destDir, destName);
const thumbName = `${seoSlug}-thumb.webp`;
const thumbPath = join(destDir, thumbName);

// Ana görsel: max 1200px genişlik, WebP, quality 80
const mainResult = await sharp(sourcePath)
  .resize({ width: MAX_WIDTH, withoutEnlargement: true })
  .webp({ quality: QUALITY })
  .toFile(destPath);

// Thumbnail: 256px genişlik, daha agresif sıkıştırma
const thumbResult = await sharp(sourcePath)
  .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
  .webp({ quality: 70 })
  .toFile(thumbPath);

const mainSizeKB = (mainResult.size / 1024).toFixed(1);
const thumbSizeKB = (thumbResult.size / 1024).toFixed(1);

// ─── Orijinali inbox'tan sil ───
await unlink(sourcePath);

// ─── Blur placeholder üret (base64) ───
const blurBuffer = await sharp(destPath)
  .resize(16, 9, { fit: "cover" })
  .blur(4)
  .webp({ quality: 20 })
  .toBuffer();
const blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

// ─── Output ───
console.log(`
╔══════════════════════════════════════════════╗
║   Görsel İşlendi                             ║
╚══════════════════════════════════════════════╝

  Ana görsel : /images/${targetFolder}/${destName} (${mainSizeKB} KB, ${mainResult.width}x${mainResult.height})
  Thumbnail  : /images/${targetFolder}/${thumbName} (${thumbSizeKB} KB, ${thumbResult.width}x${thumbResult.height})
  Orijinal   : ${sourceFile} silindi (inbox temizlendi)

── Frontmatter Kopyala-Yapıştır ──

image: "/images/${targetFolder}/${destName}"
imageAlt: "${caption ?? seoSlug.replace(/-/g, " ")}"
imageCredit: ""

── Blur Placeholder (opsiyonel) ──

${blurDataURL}
`);
