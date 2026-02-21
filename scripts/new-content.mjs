#!/usr/bin/env node

// ─────────────────────────────────────────────────────────────
// AI Rehber — İçerik Scaffolding Script
// İnteraktif olarak yeni içerik MDX dosyaları oluşturur.
//
// Kullanım:
//   node scripts/new-content.mjs yazi
//   node scripts/new-content.mjs haber
//   node scripts/new-content.mjs prompt
//   node scripts/new-content.mjs kart
//   node scripts/new-content.mjs haftalik
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

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
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

## Ne Oldu?

[1-2 cümle net özet.]

## Neden Önemli?

[Bağlam ve etki analizi.]

## Türkiye İçin Ne Anlama Geliyor?

[Yerel perspektif.]
`;

  writeContent("haberler", `${slug}.mdx`, content);
}

async function newPrompt(rl) {
  console.log("\n🎯 Yeni Prompt Oluştur\n");

  const title = await ask(rl, "Başlık (max 70 karakter)");
  const slug = await ask(rl, "Slug", slugify(title));
  const description = await ask(rl, "Açıklama (max 160 karakter)");
  const category = await choose(rl, "Kategori:", [
    "icerik-uretim",
    "kod",
    "analiz",
    "pazarlama",
    "egitim",
    "genel",
  ]);
  const difficulty = await choose(rl, "Zorluk:", [
    "baslangic",
    "orta",
    "ileri",
  ]);
  const targetRole = await ask(rl, "Hedef kitle (ör: Pazarlamacı)");
  const keywords = await ask(rl, "Keywords (virgülle ayır, max 5)");

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
prompt: |
  PROMPT METNİ BURAYA

  [DEĞİŞKEN_1] ve [DEĞİŞKEN_2] yerlerine kendi değerlerinizi yazın.
category: ${category}
difficulty: ${difficulty}
targetRole: "${targetRole}"
models:
  - name: "Claude Opus 4"
    score: 0
    note: ""
  - name: "GPT-4.1"
    score: 0
    note: ""
variables:
  - name: "DEĞİŞKEN_1"
    description: "Açıklama"
    example: "Örnek değer"
commonMistakes:
  - "Sık yapılan hata 1"
  - "Sık yapılan hata 2"
keywords:
${keywordList.map((k) => `  - "${k}"`).join("\n")}
published: true
---

## Bu Prompt Ne İşe Yarar?

[Hangi sorunu çözer, kimin için faydalı.]

## Nasıl Kullanılır?

1. Değişkenleri doldurun
2. Modele yapıştırın
3. Çıktıyı kontrol edin

## Örnek Çıktı

> [Örnek çıktı buraya]

## İpuçları

- [İpucu 1]
- [İpucu 2]
`;

  writeContent("promptlar", `${slug}.mdx`, content);
}

async function newHaftalik(rl) {
  console.log("\n📅 Yeni Haftalık Brifing Oluştur\n");

  const now = new Date();
  const weekNum = getISOWeek(now);
  const year = now.getFullYear();

  const weekNumber = await ask(rl, "Hafta numarası", String(weekNum));
  const yearStr = await ask(rl, "Yıl", String(year));
  const wn = weekNumber.padStart(2, "0");
  const slug = `${yearStr}-w${wn}`;

  const content = `---
title: "AI Haftalık Brifing — Hafta ${weekNumber}, ${yearStr}"
slug: "${slug}"
description: "${yearStr} yılının ${weekNumber}. haftasında öne çıkan AI gelişmeleri ve eylem önerisi"
weekNumber: ${parseInt(weekNumber)}
year: ${parseInt(yearStr)}
date: ${today()}
highlights:
  - title: "Highlight 1"
    summary: "Özet"
    url: ""
  - title: "Highlight 2"
    summary: "Özet"
    url: ""
  - title: "Highlight 3"
    summary: "Özet"
    url: ""
weeklyAction: "Bu hafta yapmanız gereken eylem"
published: true
---

## Bu Hafta Neler Oldu?

[Haftanın genel tonu.]

### 1. [Highlight 1]

[Detaylı özet — 3-5 cümle.]

### 2. [Highlight 2]

[Detaylı özet — 3-5 cümle.]

### 3. [Highlight 3]

[Detaylı özet — 3-5 cümle.]

## Haftanın Sayıları

- **[Sayı 1]:** [Bağlam]
- **[Sayı 2]:** [Bağlam]

## Bu Hafta Ne Yapmalısınız?

[Haftalık aksiyon detayı.]
`;

  writeContent("haftalik", `${slug}.mdx`, content);
}

// ─── Main ────────────────────────────────────────────────────

const type = process.argv[2];
const TYPES = {
  yazi: newYazi,
  haber: newHaber,
  prompt: newPrompt,
  haftalik: newHaftalik,
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
║     npm run new:prompt                       ║
║     npm run new:haftalik                     ║
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
