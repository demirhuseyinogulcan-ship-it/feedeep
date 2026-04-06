#!/usr/bin/env node

// ─────────────────────────────────────────────────────────────
// AI Rehber — İçerik Scaffolding Script
// İnteraktif olarak yeni içerik MDX dosyaları oluşturur.
//
// Kullanım:
//   node scripts/new-content.mjs yazi
//   node scripts/new-content.mjs haber
// ─────────────────────────────────────────────────────────────

import { createInterface } from "readline";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, "..", "content");

// ─── Helpers ─────────────────────────────────────────────────

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function ask(rl, question, defaultValue) {
  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue || "");
    });
  });
}

function choose(rl, question, options) {
  return new Promise((resolve) => {
    console.log(`\n${question}`);
    options.forEach((opt, i) => console.log(`  ${i + 1}. ${opt}`));
    rl.question(`Seçim (1-${options.length}): `, (answer) => {
      const idx = parseInt(answer) - 1;
      resolve(options[idx] || options[0]);
    });
  });
}

function writeContent(dir, filename, content) {
  const dirPath = join(CONTENT_DIR, dir);
  if (!existsSync(dirPath)) mkdirSync(dirPath, { recursive: true });
  const filePath = join(dirPath, filename);
  if (existsSync(filePath)) {
    console.error(`\n❌ Dosya zaten var: ${filePath}`);
    process.exit(1);
  }
  writeFileSync(filePath, content, "utf-8");
  console.log(`\n✅ Oluşturuldu: content/${dir}/${filename}`);
}

// ─── Template Generators ────────────────────────────────────

async function newYazi(rl) {
  console.log("\n📝 Yeni Yazı Oluştur\n");

  const title = await ask(rl, "Başlık (max 70 karakter)");
  const slug = await ask(rl, "Slug", slugify(title));
  const description = await ask(rl, "Açıklama (max 160 karakter)");
  const category = await choose(rl, "Kategori:", [
    "rehber",
    "inceleme",
    "analiz",
    "karsilastirma",
  ]);
  const keywords = await ask(rl, "Keywords (virgülle ayır, max 5)");
  const confidence = await choose(rl, "Güven seviyesi:", [
    "high",
    "medium",
    "speculative",
  ]);
  const sourceUrl = await ask(rl, "Birincil kaynak URL");
  const sourceLabel = await ask(rl, "Kaynak adı");

  const keywordList = keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 5);

  const content = `---
title: "${title}"
slug: ${slug}
description: "${description}"
date: ${today()}
category: ${category}
keywords:
${keywordList.map((k) => `  - "${k}"`).join("\n")}
image: ""
sources:
  - url: "${sourceUrl}"
    label: "${sourceLabel}"
    tier: 1
confidence: ${confidence}
lastFactChecked: ${today()}
corrections: []
counterpoint: ""
actionItems:
  - ""
socialSnippet: ""
published: true
---

## [Dikkat Çekici Giriş]

[Hook cümlesi — okuyucu neden devam etsin?]

## [Ana Konu]

[Ana değer burada sunulacak.]

## Pratik Uygulama

1. **Adım 1:** ...
2. **Adım 2:** ...

## Sonuç

[Özet + gelecek perspektifi.]
`;

  writeContent("yazilar", `${slug}.mdx`, content);
}

async function newHaber(rl) {
  console.log("\n📰 Yeni Haber Oluştur\n");

  const title = await ask(rl, "Başlık (max 70 karakter)");
  const slug = await ask(rl, "Slug", slugify(title));
  const description = await ask(rl, "Açıklama (max 160 karakter)");
  const sourceUrl = await ask(rl, "Orijinal haber URL'si");
  const sourceName = await ask(rl, "Kaynak adı (ör: TechCrunch)");
  const category = await choose(rl, "Kategori:", [
    "sirketler",
    "sektor",
    "turkiye",
    "arastirma",
  ]);
  const keywords = await ask(rl, "Keywords (virgülle ayır, max 5)");
  const confidence = await choose(rl, "Güven seviyesi:", [
    "high",
    "medium",
    "speculative",
  ]);

  const keywordList = keywords
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 5);

  const content = `---
title: "${title}"
slug: ${slug}
description: "${description}"
date: ${today()}
sourceUrl: "${sourceUrl}"
sourceName: "${sourceName}"
category: ${category}
keywords:
${keywordList.map((k) => `  - "${k}"`).join("\n")}
sources:
  - url: "${sourceUrl}"
    label: "${sourceName}"
    tier: 1
confidence: ${confidence}
socialSnippet: ""
published: true
---

[HOOK: Haberin en dikkat çekici cümlesiyle başla.]

[BAĞLAM: Detayları ver, teknik kavramları doğal biçimde açıkla.]

[ANALİZ: Somut değer — rakam, karşılaştırma, insider bilgi.]

[KAPANIŞ: Pratik adım veya gelecek perspektifi.]
`;

  writeContent("haberler", `${slug}.mdx`, content);
}

// ─── Main ────────────────────────────────────────────────────

const type = process.argv[2];
const TYPES = {
  yazi: newYazi,
  haber: newHaber,
};

if (!type || !TYPES[type]) {
  console.log(`
╔══════════════════════════════════════════════╗
║   AI Rehber — İçerik Oluşturucu              ║
╠══════════════════════════════════════════════╣
║                                              ║
║   Kullanım:                                  ║
║     npm run new:yazi                         ║
║     npm run new:haber                        ║
║                                              ║
╚══════════════════════════════════════════════╝
`);
  process.exit(0);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });

try {
  await TYPES[type](rl);
} finally {
  rl.close();
}
