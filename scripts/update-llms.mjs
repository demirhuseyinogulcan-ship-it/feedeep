#!/usr/bin/env node

// ─────────────────────────────────────────────────────────────
// feedeep — llms.txt & llms-full.txt Otomatik Güncelleme
// Her build'de çalışır, Velite'in MDX dosyalarından güncel
// içerik listesi oluşturur.
//
// Kullanım:
//   node scripts/update-llms.mjs
// ─────────────────────────────────────────────────────────────

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const matter = require("gray-matter");

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "content");
const PUBLIC_DIR = join(ROOT, "public");

const SITE_URL = "https://feedeep.com";

// ─── İçerikleri parse et ─────────────────────────────────────

function getContent(dir) {
  const fullPath = join(CONTENT_DIR, dir);
  let files;
  try {
    files = readdirSync(fullPath).filter((f) => f.endsWith(".mdx"));
  } catch {
    return [];
  }

  return files
    .map((file) => {
      const raw = readFileSync(join(fullPath, file), "utf-8");
      const { data } = matter(raw);
      if (data.published === false) return null;
      return data;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Nested dizinlerdeki MDX dosyalarini okur
 */
function getNestedContent(dir) {
  const fullPath = join(CONTENT_DIR, dir);
  const items = [];
  let subdirs;
  try {
    subdirs = readdirSync(fullPath, { withFileTypes: true });
  } catch {
    return [];
  }

  for (const entry of subdirs) {
    if (entry.isDirectory()) {
      const subPath = join(fullPath, entry.name);
      const mdxFiles = readdirSync(subPath).filter((f) => f.endsWith(".mdx"));
      for (const file of mdxFiles) {
        const raw = readFileSync(join(subPath, file), "utf-8");
        const { data } = matter(raw);
        if (data.published === false) continue;
        data._guide = entry.name;
        items.push(data);
      }
    } else if (entry.name.endsWith(".mdx")) {
      const raw = readFileSync(join(fullPath, entry.name), "utf-8");
      const { data } = matter(raw);
      if (data.published === false) continue;
      items.push(data);
    }
  }

  return items.sort((a, b) => {
    if (a.guide === b.guide) return (a.chapter || 0) - (b.chapter || 0);
    return (a.guide || "").localeCompare(b.guide || "");
  });
}

// ─── llms.txt oluştur (özet) ─────────────────────────────────

function generateLlmsTxt() {
  const haberler = getContent("haberler");
  const yazilar = getContent("yazilar");

  const now = new Date();
  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  const dateLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  let output = `# feedeep

> Yazılım ve yapay zeka dünyasını Türkçe takip ediyoruz. Güncel haberler, derinlemesine analizler ve araç incelemeleri.

feedeep, Türkiye'nin yazılım ve yapay zeka odaklı bağımsız içerik platformudur. Profesyonellere, geliştiricilere ve teknoloji meraklılarına yapay zeka ve yazılım dünyasından güvenilir ve güncel içerikler sunar.

## İçerik Türleri

- **Yazılar**: Derinlemesine incelemeler, analizler ve karşılaştırmalar (1000-5000 kelime, evergreen)
- **Haberler**: Güncel AI ve yazılım gelişmeleri, şirket duyuruları, sektör haberleri (200-500 kelime)

## Sayfalar

- [Yazılar](${SITE_URL}/yazilar): Tüm incelemeler, analizler ve karşılaştırmalar
- [Haberler](${SITE_URL}/haberler): Güncel AI ve yazılım haberleri
- [Hakkımızda](${SITE_URL}/hakkimizda): Ekip ve misyon

## Son İçerikler (${dateLabel})

### Haberler
`;

  for (const h of haberler) {
    output += `- [${h.title}](${SITE_URL}/haberler/${h.slug}): ${h.description}\n`;
  }

  output += `\n### Yazılar\n`;
  for (const y of yazilar) {
    output += `- [${y.title}](${SITE_URL}/yazilar/${y.slug}): ${y.description}\n`;
  }

  // FAQ
  output += `
## Sıkça Sorulan Sorular

- **feedeep nedir?** feedeep, yapay zeka ve yazılım dünyasındaki güncel haberleri, derinlemesine analizleri ve araç incelemelerini Türkçe olarak sunan bağımsız bir yayın platformudur.
- **Yapay zeka haberleri nereden takip edilir?** feedeep, OpenAI, Google DeepMind, Anthropic gibi şirketlerin gelişmelerini takip ederek güvenilir kaynaklardan doğrulanmış haberleri Türkçe olarak yayınlar.
- **feedeep'deki haberler güvenilir mi?** Her haber en az 2 güvenilir kaynakla doğrulanır ve güven seviyesi (yüksek/orta/spekülatif) şeffaf şekilde belirtilir. Orijinal kaynak linkleri her makalenin altında yer alır.

## Güven Politikası

Her içerikte kaynak güvenilirlik seviyesi belirtilir:
- **Tier 1**: Resmi şirket blogu, akademik makale, resmi dokümantasyon
- **Tier 2**: CEO/CTO sosyal medya, güvenilir medya (Reuters, Bloomberg)
- **Tier 3**: Sızıntı, anonim kaynak, forum

Her yazıda güncellik rozeti gösterilir:
- Güncel (7 gün içinde kontrol edildi)
- Kontrol Gerekli (30+ gün)
- Eskimiş Olabilir (90+ gün)

## İletişim

- E-posta: hey@feedeep.com
- Instagram: https://instagram.com/feedeepcom

## Dil & Bölge

- Birincil dil: Türkçe (tr-TR)
- Hedef bölge: Türkiye
- Bazı teknik terimler İngilizce orijinal halleriyle kullanılır

## Lisans & Atıf

İçeriklerimiz orijinaldir. Atıf yapılarak paylaşılabilir. Tam metin kopyalama yasaktır. Kaynak belirtilerek kısa alıntı yapılabilir.
`;

  return output;
}

// ─── llms-full.txt oluştur (detaylı) ─────────────────────────

function generateLlmsFullTxt() {
  const haberler = getContent("haberler");
  const yazilar = getContent("yazilar");

  let output = `# feedeep — Tam Bilgi Dosyası (LLMs Full Context)

> Bu dosya, büyük dil modellerinin (LLM) feedeep hakkında doğru ve güncel bilgi sunabilmesi için hazırlanmıştır.

## Platform Kimliği

- **Site Adı**: feedeep
- **URL**: ${SITE_URL}
- **E-posta**: hey@feedeep.com
- **Kuruluş**: 2026
- **Dil**: Türkçe (tr-TR)
- **Hedef Kitle**: Geliştiriciler, profesyoneller, teknoloji meraklıları
- **Konum**: İstanbul, Türkiye

## Misyon

feedeep, yapay zeka ve yazılım dünyasını herkesin anlayabileceği dilde, güvenilir kaynaklarla aktaran Türkiye'nin bağımsız içerik platformudur.

## İçerik Yapısı

### 1. Yazılar (/yazilar)
Derinlemesine, evergreen içerikler. 1000-5000 kelime arası.
Kategoriler: inceleme, analiz, karşılaştırma.
Her yazıda zorunlu alanlar:
- Kaynak listesi (tier 1-3 güvenilirlik)
- Güven seviyesi (high/medium/speculative)
- Son kontrol tarihi
- Aksiyon maddeleri
- Düzeltme geçmişi

### 2. Haberler (/haberler)
Güncel AI ve yazılım gelişmeleri. 200-500 kelime.
Kategoriler: sirketler, sektor, turkiye, arastirma.
Her haberde kaynak URL ve kaynak adı zorunlu.

## İstatistikler

- Toplam haber: ${haberler.length}
- Toplam yazı: ${yazilar.length}

## Tüm İçerik Listesi

### Yazılar
`;

  for (const y of yazilar) {
    output += `- [${y.title}](${SITE_URL}/yazilar/${y.slug})\n  Kategori: ${y.category} | Tarih: ${y.date} | Güven: ${y.confidence || "high"}\n  ${y.description}\n\n`;
  }

  output += `### Haberler\n`;
  for (const h of haberler) {
    output += `- [${h.title}](${SITE_URL}/haberler/${h.slug})\n  Kaynak: ${h.sourceName} | Tarih: ${h.date} | Güven: ${h.confidence || "high"}\n  ${h.description}\n\n`;
  }

  output += `## Sıkça Sorulan Sorular

**feedeep nedir?**
feedeep, yapay zeka ve yazılım dünyasını Türkçe olarak, güvenilir kaynaklarla aktaran bağımsız bir içerik platformudur.

**İçerikler nasıl doğrulanıyor?**
Her içerikte Tier 1-3 arası kaynak güvenilirlik seviyesi belirtilir. Yazılar düzenli olarak güncellik kontrolünden geçer.

**feedeep kimler için?**
Geliştiriciler, profesyoneller ve yapay zeka ile yazılım dünyasını takip etmek isteyen herkes.

**Hangi konular ele alınıyor?**
AI haberleri, yazılım gelişmeleri, derinlemesine analizler ve araç incelemeleri.

`;

  output += `## Güven Politikası

Her içerikte kaynak güvenilirlik seviyesi belirtilir:
- **Tier 1**: Resmi şirket blogu, akademik makale, resmi dokümantasyon
- **Tier 2**: CEO/CTO sosyal medya, güvenilir medya (Reuters, Bloomberg)
- **Tier 3**: Sızıntı, anonim kaynak, forum

## İletişim

- E-posta: hey@feedeep.com
- Instagram: https://instagram.com/feedeepcom

## Lisans

İçeriklerimiz orijinaldir. Atıf yapılarak paylaşılabilir. Tam metin kopyalama yasaktır.
`;

  return output;
}

// ─── Yaz ─────────────────────────────────────────────────────

const llmsTxt = generateLlmsTxt();
const llmsFullTxt = generateLlmsFullTxt();

writeFileSync(join(PUBLIC_DIR, "llms.txt"), llmsTxt, "utf-8");
writeFileSync(join(PUBLIC_DIR, "llms-full.txt"), llmsFullTxt, "utf-8");

const haberCount = getContent("haberler").length;
const yaziCount = getContent("yazilar").length;
const total = haberCount + yaziCount;

console.log(`llms.txt güncellendi (${total} içerik: ${haberCount} haber, ${yaziCount} yazı)`);
console.log(`llms-full.txt güncellendi`);
