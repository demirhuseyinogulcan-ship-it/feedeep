#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// feedeep — Otomatik Tag Atama Scripti
// MDX dosyalarının frontmatter'ına dosya adı kurallarına göre
// tags: alanı ekler. Mevcut tag'leri korur, yeni tag'leri ekler.
//
// Kullanım:
//   node scripts/assign-tags.mjs          → dry-run (sadece gösterir)
//   node scripts/assign-tags.mjs --write  → dosyalara yazar
// ─────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, basename } from "path";

const CONTENT_DIR = join(process.cwd(), "content");
const DRY_RUN = !process.argv.includes("--write");

// ─── Şirket Kuralları ───────────────────────────────────────

const COMPANY_RULES = [
  { prefix: "openai-", tag: "openai" },
  { prefix: "anthropic-", tag: "anthropic" },
  { prefix: "google-", tag: "google" },
  { prefix: "meta-", tag: "meta" },
  { prefix: "microsoft-", tag: "microsoft" },
  { prefix: "alibaba-", tag: "alibaba" },
  { prefix: "nvidia-", tag: "nvidia" },
  { prefix: "apple-", tag: "apple" },
  { prefix: "cursor-", tag: "cursor" },
  { prefix: "mistral-", tag: "mistral" },
  { prefix: "bytedance-", tag: "bytedance" },
  { prefix: "cloudflare-", tag: "cloudflare" },
  { prefix: "figma-", tag: "figma" },
  { prefix: "github-", tag: "github" },
  { prefix: "perplexity-", tag: "perplexity" },
  { prefix: "cohere-", tag: "cohere" },
  { prefix: "atlassian-", tag: "atlassian" },
  { prefix: "slack-", tag: "slack" },
  { prefix: "adobe-", tag: "adobe" },
  { prefix: "elevenlabs-", tag: "elevenlabs" },
  { prefix: "chatgpt-", tag: "openai" },
  { prefix: "claude-", tag: "anthropic" },
  { prefix: "sam-altman-", tag: "openai" },
  { prefix: "dario-amodei-", tag: "anthropic" },
  { prefix: "pentagon-anthropic-", tag: "anthropic" },
  { prefix: "coreweave-", tag: "coreweave" },
  { prefix: "langchain-", tag: "langchain" },
  { prefix: "minimax-", tag: "minimax" },
  { prefix: "youtube-", tag: "google" },
  { prefix: "spotify-", tag: "spotify" },
  { prefix: "arcee-", tag: "arcee" },
  { prefix: "luminai-", tag: "luminai" },
  { prefix: "decagon-", tag: "decagon" },
  { prefix: "afterquery-", tag: "afterquery" },
  { prefix: "agoda-", tag: "agoda" },
  { prefix: "santander-", tag: "santander" },
  { prefix: "black-forest-", tag: "black-forest-labs" },
  { prefix: "g42-", tag: "g42" },
];

// İçerik eşleşmeleri (dosya adı + slug içinde arama)
const CONTENT_RULES = [
  { pattern: /claude/, tag: "anthropic" },
  { pattern: /chatgpt/, tag: "openai" },
  { pattern: /gpt-5|gpt-4|codex/, tag: "openai" },
  { pattern: /gemini|gemma/, tag: "google" },
  { pattern: /copilot/, tag: "microsoft" },
  { pattern: /qwen/, tag: "alibaba" },
  { pattern: /llama/, tag: "meta" },
  { pattern: /seedance/, tag: "bytedance" },
  { pattern: /trendyol|visby|turkiye/, tag: "turkiye" },
  { pattern: /openai/, tag: "openai" },
];

// ─── Konu Kuralları ─────────────────────────────────────────

const TOPIC_RULES = [
  { pattern: /model|benchmark|parametre|token|fine-?tun|llm|attention|transformer/, tag: "ai-model" },
  { pattern: /agent|ajan|otonom|otomasyon|swarm/, tag: "ai-agent" },
  { pattern: /guvenli|security|injection|acig|sahte|exploit|vulnerability|fbi|siber|gizlilik/, tag: "ai-guvenlik" },
  { pattern: /milyar|milyon|yatirim|dolar|degerleme|seri[- ]?[a-g]|fonlama|satin-?al/, tag: "yatirim" },
  { pattern: /kodlama|code|cursor|copilot|ide|gelistir|developer/, tag: "kodlama" },
  { pattern: /acik-?kaynak|apache|open-?source|lisans/, tag: "acik-kaynak" },
  { pattern: /kurumsal|enterprise|b2b|roi/, tag: "kurumsal-ai" },
  { pattern: /ses|voice|tts|muzik|video|gorsel|goruntu|uretim/, tag: "ses-gorsel-video" },
  { pattern: /arastirma|bilimsel|makale|paper|deney|gallup|rapor|anket/, tag: "arastirma" },
  { pattern: /isten-cikar|\bcv\b|kariyer|zam|yonetici|toplanti|calisan|washing|ogren|is-hayat|excel/, tag: "is-hayati" },
];

// ─── Yardımcı Fonksiyonlar ──────────────────────────────────

function inferTags(filename) {
  const name = filename.replace(/\.mdx$/, "").toLowerCase();
  const tags = new Set();

  // Şirket prefix kuralları
  for (const rule of COMPANY_RULES) {
    if (name.startsWith(rule.prefix)) {
      tags.add(rule.tag);
    }
  }

  // İçerik eşleşme kuralları
  for (const rule of CONTENT_RULES) {
    if (rule.pattern.test(name)) {
      tags.add(rule.tag);
    }
  }

  // Konu kuralları
  for (const rule of TOPIC_RULES) {
    if (rule.pattern.test(name)) {
      tags.add(rule.tag);
    }
  }

  return [...tags].sort();
}

function parseFrontmatter(content) {
  // CRLF ve LF her ikisini de destekle
  const normalized = content.replace(/\r\n/g, "\n");
  const match = normalized.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { frontmatter: null, normalized };
  return { frontmatter: match[1], normalized };
}

function getExistingTags(frontmatter) {
  const tagsMatch = frontmatter.match(/^tags:\s*\n((?:\s+-\s+.*\n)*)/m);
  if (!tagsMatch) return [];
  return tagsMatch[1]
    .split("\n")
    .map((line) => line.replace(/^\s+-\s+/, "").trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function hasTags(frontmatter) {
  return /^tags:/m.test(frontmatter);
}

function insertTags(content, tags) {
  if (tags.length === 0) return content;

  const tagsYaml = `tags:\n${tags.map((t) => `  - ${t}`).join("\n")}`;

  // tags: varsa değiştir
  if (/^tags:\s*(\[\]|\n(?:\s+-\s+.*\n)*)/m.test(content)) {
    return content.replace(
      /^tags:\s*(\[\]|\n(?:\s+-\s+.*\n)*)/m,
      tagsYaml + "\n"
    );
  }

  // tags: yoksa keywords: bloğunun hemen sonrasına ekle
  const keywordsEnd = content.match(
    /^(keywords:\s*\n(?:\s+-\s+.*\n)*)/m
  );
  if (keywordsEnd) {
    const insertPoint = keywordsEnd.index + keywordsEnd[0].length;
    return (
      content.slice(0, insertPoint) +
      tagsYaml +
      "\n" +
      content.slice(insertPoint)
    );
  }

  // Fallback: ilk --- kapanışından önce ekle
  return content.replace(/\n---/, `\n${tagsYaml}\n---`);
}

// ─── Ana İşlem ──────────────────────────────────────────────

function processDirectory(subdir) {
  const dir = join(CONTENT_DIR, subdir);
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }

  const results = [];

  for (const file of files) {
    const filePath = join(dir, file);
    const rawContent = readFileSync(filePath, "utf-8");
    const { frontmatter, normalized } = parseFrontmatter(rawContent);
    if (!frontmatter) continue;

    const existingTags = getExistingTags(frontmatter);
    const inferredTags = inferTags(file);

    // Mevcut tag'leri koru, yeni tag'leri ekle
    const mergedTags = [...new Set([...existingTags, ...inferredTags])].sort();

    if (mergedTags.length === 0) continue;

    // Değişiklik var mı kontrol et
    const changed =
      mergedTags.length !== existingTags.length ||
      mergedTags.some((t, i) => t !== existingTags.sort()[i]);

    if (!changed) continue;

    results.push({
      file: `${subdir}/${file}`,
      existing: existingTags,
      inferred: inferredTags,
      merged: mergedTags,
    });

    if (!DRY_RUN) {
      const updated = insertTags(normalized, mergedTags);
      writeFileSync(filePath, updated, "utf-8");
    }
  }

  return results;
}

// ─── Çalıştır ───────────────────────────────────────────────

console.log(DRY_RUN ? "\n🔍 DRY RUN — dosya değişmeyecek\n" : "\n✏️  WRITE MODE — dosyalara yazılıyor\n");

const allResults = [
  ...processDirectory("haberler"),
  ...processDirectory("yazilar"),
];

if (allResults.length === 0) {
  console.log("Tüm dosyalarda tag'ler güncel, değişiklik yok.");
} else {
  console.log(`${allResults.length} dosya ${DRY_RUN ? "güncellenecek" : "güncellendi"}:\n`);
  for (const r of allResults) {
    const newTags = r.merged.filter((t) => !r.existing.includes(t));
    console.log(`  ${r.file}`);
    if (r.existing.length > 0) {
      console.log(`    mevcut: [${r.existing.join(", ")}]`);
    }
    console.log(`    + eklenecek: [${newTags.join(", ")}]`);
    console.log(`    = sonuç: [${r.merged.join(", ")}]\n`);
  }
}

if (DRY_RUN) {
  console.log("Dosyalara yazmak için: node scripts/assign-tags.mjs --write\n");
}
