#!/usr/bin/env node

// ─────────────────────────────────────────────────────────────
// AI Rehber — İçerik Doğrulayıcı (Content Validator)
// Tüm MDX dosyalarının frontmatter'ını kontrol eder.
//
// Kullanım:
//   npm run validate         # Tüm içerikleri kontrol et
//   node scripts/validate-content.mjs yazilar  # Sadece yazıları
// ─────────────────────────────────────────────────────────────

import { readdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(__dirname, "..", "content");

let totalErrors = 0;
let totalWarnings = 0;
let totalFiles = 0;

// ─── Helpers ─────────────────────────────────────────────────

function parseFrontmatter(content) {
  try {
    const { data } = matter(content);
    if (!data || Object.keys(data).length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

function error(file, msg) {
  console.log(`  ❌ ${msg}`);
  totalErrors++;
}

function warn(file, msg) {
  console.log(`  ⚠️  ${msg}`);
  totalWarnings++;
}

// eslint-disable-next-line no-unused-vars
function ok(msg) {
  console.log(`  ✅ ${msg}`);
}

function checkRequired(file, data, field) {
  if (data[field] === undefined || data[field] === "" || data[field] === null) {
    error(file, `Zorunlu alan eksik: ${field}`);
    return false;
  }
  return true;
}

function checkMaxLength(file, data, field, max) {
  if (data[field] && String(data[field]).length > max) {
    error(file, `${field} çok uzun: ${String(data[field]).length} karakter (max ${max})`);
  }
}

function checkEnum(file, data, field, options) {
  if (data[field] && !options.includes(data[field])) {
    error(file, `${field} geçersiz değer: "${data[field]}" — Olası: ${options.join(", ")}`);
  }
}

function checkSlug(file, data) {
  if (data.slug && /[şçğıöüŞÇĞİÖÜ]/.test(data.slug)) {
    error(file, `Slug'da Türkçe karakter var: "${data.slug}"`);
  }
  if (data.slug && data.slug.length > 60) {
    warn(file, `Slug çok uzun (${data.slug.length} > 60 karakter)`);
  }
}

function checkDate(file, data, field) {
  if (data[field]) {
    // gray-matter parses dates as Date objects
    if (data[field] instanceof Date) return; // valid
    if (typeof data[field] === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data[field])) return; // valid
    error(file, `${field} geçersiz tarih formatı: "${data[field]}" — YYYY-MM-DD bekleniyor`);
  }
}

function checkUrl(file, data, field) {
  if (data[field] && typeof data[field] === "string") {
    try {
      new URL(data[field]);
    } catch {
      error(file, `${field} geçersiz URL: "${data[field]}"`);
    }
  }
}

// ─── Validators per Type ────────────────────────────────────

function validateYazi(file, data) {
  checkRequired(file, data, "title");
  checkRequired(file, data, "slug");
  checkRequired(file, data, "description");
  checkRequired(file, data, "date");
  checkRequired(file, data, "category");
  checkRequired(file, data, "confidence");
  checkRequired(file, data, "lastFactChecked");

  checkMaxLength(file, data, "title", 70);
  checkMaxLength(file, data, "description", 160);
  checkSlug(file, data);
  checkDate(file, data, "date");
  checkDate(file, data, "lastFactChecked");
  checkEnum(file, data, "category", ["rehber", "inceleme", "analiz", "karsilastirma"]);
  checkEnum(file, data, "confidence", ["high", "medium", "speculative"]);

  if (!data.sources || (Array.isArray(data.sources) && data.sources.length === 0)) {
    warn(file, "sources alanı boş — en az 1 kaynak gerekli");
  }
}

function validateHaber(file, data) {
  checkRequired(file, data, "title");
  checkRequired(file, data, "slug");
  checkRequired(file, data, "description");
  checkRequired(file, data, "date");
  checkRequired(file, data, "sourceUrl");
  checkRequired(file, data, "sourceName");
  checkRequired(file, data, "category");

  checkMaxLength(file, data, "title", 70);
  checkMaxLength(file, data, "description", 160);
  checkSlug(file, data);
  checkDate(file, data, "date");
  checkUrl(file, data, "sourceUrl");
  checkEnum(file, data, "category", ["sirketler", "sektor", "turkiye", "arastirma"]);
  checkEnum(file, data, "confidence", ["high", "medium", "speculative"]);
}

function validatePrompt(file, data) {
  checkRequired(file, data, "title");
  checkRequired(file, data, "slug");
  checkRequired(file, data, "description");
  checkRequired(file, data, "date");
  checkRequired(file, data, "prompt");
  checkRequired(file, data, "category");
  checkRequired(file, data, "difficulty");

  checkMaxLength(file, data, "title", 70);
  checkMaxLength(file, data, "description", 160);
  checkSlug(file, data);
  checkDate(file, data, "date");
  checkEnum(file, data, "category", [
    "icerik-uretim", "kod", "analiz", "pazarlama", "egitim", "genel",
  ]);
  checkEnum(file, data, "difficulty", ["baslangic", "orta", "ileri"]);

  if (!data.commonMistakes || data.commonMistakes.length < 2) {
    warn(file, "commonMistakes en az 2 hata içermeli");
  }
}

// eslint-disable-next-line no-unused-vars
function validateKart(file, data) {
  checkRequired(file, data, "title");
  checkRequired(file, data, "slug");
  checkRequired(file, data, "description");
  checkRequired(file, data, "date");
  checkRequired(file, data, "type");
  checkRequired(file, data, "company");

  checkMaxLength(file, data, "description", 160);
  checkSlug(file, data);
  checkDate(file, data, "date");
  checkEnum(file, data, "type", ["model", "arac"]);
  checkEnum(file, data, "status", ["active", "beta", "deprecated"]);
}

function validateHaftalik(file, data) {
  checkRequired(file, data, "title");
  checkRequired(file, data, "slug");
  checkRequired(file, data, "description");
  checkRequired(file, data, "date");
  checkRequired(file, data, "weekNumber");
  checkRequired(file, data, "year");
  checkRequired(file, data, "weeklyAction");

  checkMaxLength(file, data, "description", 160);
  checkSlug(file, data);
  checkDate(file, data, "date");

  if (data.weeklyAction === "") {
    error(file, "weeklyAction boş olamaz");
  }
}

// ─── Scanner ────────────────────────────────────────────────

const VALIDATORS = {
  yazilar: { validate: validateYazi, label: "Yazılar" },
  haberler: { validate: validateHaber, label: "Haberler" },
  promptlar: { validate: validatePrompt, label: "Promptlar" },
  haftalik: { validate: validateHaftalik, label: "Haftalık" },
};

function scanDirectory(dir) {
  const validator = VALIDATORS[dir];
  if (!validator) return;

  const dirPath = join(CONTENT_DIR, dir);
  let files;
  try {
    files = readdirSync(dirPath).filter((f) => f.endsWith(".mdx"));
  } catch {
    console.log(`\n⚠️  Dizin bulunamadı: content/${dir}/`);
    return;
  }

  if (files.length === 0) {
    console.log(`\n⚠️  ${validator.label}: Hiç içerik yok!`);
    return;
  }

  console.log(`\n── ${validator.label} (${files.length} dosya) ──`);

  for (const file of files) {
    totalFiles++;
    console.log(`\n  📄 ${file}`);
    const content = readFileSync(join(dirPath, file), "utf-8");
    const data = parseFrontmatter(content);

    if (!data) {
      error(file, "Frontmatter okunamadı — YAML formatını kontrol edin");
      continue;
    }

    validator.validate(file, data);

    // Body length check
    const bodyMatch = content.match(/^---[\s\S]*?---\n([\s\S]*)/);
    if (bodyMatch) {
      const bodyText = bodyMatch[1]
        .replace(/\{\/\*[\s\S]*?\*\/\}/g, "") // remove JSX comments
        .replace(/```[\s\S]*?```/g, "") // remove code blocks
        .replace(/[#*>\-|`\[\]()]/g, "") // remove markdown
        .trim();
      const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

      if (dir === "yazilar" && wordCount < 100) {
        warn(file, `Body çok kısa: ~${wordCount} kelime (min 800 hedef)`);
      } else if (dir === "haberler" && wordCount < 50) {
        warn(file, `Body çok kısa: ~${wordCount} kelime (min 300 hedef)`);
      }
    }
  }
}

// ─── Main ───────────────────────────────────────────────────

const target = process.argv[2]; // optional: "yazilar", "haberler" etc.

console.log("╔══════════════════════════════════════════════╗");
console.log("║   AI Rehber — İçerik Doğrulayıcı             ║");
console.log("╚══════════════════════════════════════════════╝");

if (target && VALIDATORS[target]) {
  scanDirectory(target);
} else {
  for (const dir of Object.keys(VALIDATORS)) {
    scanDirectory(dir);
  }
}

console.log("\n══════════════════════════════════════════════");
console.log(`  Toplam: ${totalFiles} dosya tarandı`);
console.log(`  ❌ Hatalar: ${totalErrors}`);
console.log(`  ⚠️  Uyarılar: ${totalWarnings}`);
console.log("══════════════════════════════════════════════\n");

if (totalErrors > 0) {
  console.log("💀 Hatalar düzeltilmeden yayınlamayın!\n");
  process.exit(1);
} else if (totalWarnings > 0) {
  console.log("👀 Uyarılar var — kontrol edin.\n");
} else {
  console.log("🎉 Tüm içerikler geçerli!\n");
}
