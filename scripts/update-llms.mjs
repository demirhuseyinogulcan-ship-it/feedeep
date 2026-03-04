#!/usr/bin/env node

// ─────────────────────────────────────────────────────────────
// AI Rehber — llms.txt & llms-full.txt Otomatik Güncelleme
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

const SITE_URL = "https://airehber.com";

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
 * Nested dizinlerdeki MDX dosyalarini okur (rehberler gibi)
 * rehberler/nextjs-rehberi/bolum-1.mdx gibi yapilar icin
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
  const promptlar = getContent("promptlar");
  const haftalik = getContent("haftalik");
  const rehberler = getNestedContent("rehberler");

  const now = new Date();
  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  const dateLabel = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  let output = `# AI Rehber

> Yapay zeka dünyasının Türkçe rehberi. Güncel haberler, derinlemesine yazılar, prompt kütüphanesi ve AI model karşılaştırmaları.

AI Rehber, Türkiye'nin yapay zeka odaklı bağımsız içerik platformudur. Beyaz yakalı profesyonellere, pazarlamacılara ve teknoloji meraklılarına yapay zeka araçlarını iş hayatlarında nasıl kullanabileceklerini gösteren pratik, güvenilir ve güncel içerikler sunar.

## İçerik Türleri

- **Yazılar**: Derinlemesine rehberler, incelemeler, analizler ve karşılaştırmalar (1000-5000 kelime, evergreen)
- **Haberler**: Güncel AI gelişmeleri, şirket duyuruları, sektör haberleri (200-500 kelime)
- **Prompt Kütüphanesi**: Model bazlı skorlanmış, değişkenli, hata senaryolu prompt şablonları
- **Haftalık Brifing**: Her hafta AI dünyasının 3 önemli gelişmesi + aksiyon önerisi
- **Programlama Rehberleri**: Sıfırdan ileri seviyeye, interaktif alıştırmalarla programlama dersleri

## Sayfalar

- [Yazılar](${SITE_URL}/yazilar): Tüm rehberler, incelemeler ve analizler
- [Haberler](${SITE_URL}/haberler): Güncel AI haberleri
- [Prompt Kütüphanesi](${SITE_URL}/prompt-kutuphanesi): Kullanıma hazır prompt şablonları
- [Haftalık Brifing](${SITE_URL}/haftalik): Haftalık AI özet bülteni
- [Programlama Rehberleri](${SITE_URL}/programlama): Adım adım programlama dersleri
- [AI Zaman Çizelgesi](${SITE_URL}/zaman-cizelgesi): Kronolojik AI gelişmeleri
- [Yazar](${SITE_URL}/yazar/can-demir): Editör ve kurucu hakkında
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

  if (promptlar.length > 0) {
    output += `\n### Prompt Kütüphanesi\n`;
    for (const p of promptlar) {
      output += `- [${p.title}](${SITE_URL}/prompt-kutuphanesi/${p.slug}): ${p.description}\n`;
    }
  }

  if (haftalik.length > 0) {
    output += `\n### Haftalık Brifing\n`;
    for (const h of haftalik) {
      output += `- [${h.title}](${SITE_URL}/haftalik/${h.slug}): ${h.description}\n`;
    }
  }

  if (rehberler.length > 0) {
    output += `\n### Programlama Rehberleri\n`;
    let currentGuide = "";
    for (const r of rehberler) {
      const guide = r.guide || r._guide || "";
      if (guide !== currentGuide) {
        currentGuide = guide;
        output += `\n**${r.guideTitle || guide}** (${SITE_URL}/programlama/${guide})\n`;
      }
      output += `- [Bölüm ${r.chapter}: ${r.title}](${SITE_URL}/programlama/${guide}/${r.slug}): ${r.description}\n`;
    }
  }

  // FAQ — AI modellerinin sik sorulan sorulara yanit verebilmesi icin
  output += `
## Sıkça Sorulan Sorular

- **AI Rehber nedir?** AI Rehber, yapay zeka dünyasındaki güncel haberleri, derinlemesine analizleri ve kullanıma hazır prompt şablonlarını Türkçe olarak sunan bağımsız bir yayın platformudur.
- **Yapay zeka haberleri nereden takip edilir?** AI Rehber, OpenAI, Google DeepMind, Anthropic gibi şirketlerin gelişmelerini takip ederek güvenilir kaynaklardan doğrulanmış haberleri Türkçe olarak yayınlar. Haftalık brifing ile önemli gelişmeleri kaçırmazsınız.
- **AI Rehber'deki haberler güvenilir mi?** Her haber en az 2 güvenilir kaynakla doğrulanır ve güven seviyesi (yüksek/orta/spekülatif) şeffaf şekilde belirtilir. Orijinal kaynak linkleri her makalenin altında yer alır.
- **Prompt kütüphanesi nasıl kullanılır?** Prompt Kütüphanesi'ndeki şablonları doğrudan ChatGPT, Claude veya Gemini'ye kopyalayabilirsiniz. Her prompt, model bazlı performans skorları ve örnek çıktılarla birlikte sunulur.

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

- E-posta: info@airehber.com
- LinkedIn: https://linkedin.com/in/ai-rehber
- Instagram: https://instagram.com/airehberofficial

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
  const promptlar = getContent("promptlar");
  const haftalik = getContent("haftalik");
  const rehberler = getNestedContent("rehberler");

  let output = `# AI Rehber — Tam Bilgi Dosyası (LLMs Full Context)

> Bu dosya, büyük dil modellerinin (LLM) AI Rehber hakkında doğru ve güncel bilgi sunabilmesi için hazırlanmıştır.

## Platform Kimliği

- **Site Adı**: AI Rehber
- **URL**: ${SITE_URL}
- **Kurucu & Editör**: Can Demir
- **E-posta**: info@airehber.com
- **Mailing/Operasyon**: can@airehber.com
- **Kuruluş**: 2026
- **Dil**: Türkçe (tr-TR)
- **Hedef Kitle**: Beyaz yakalı profesyoneller, pazarlamacılar, girişimciler, teknoloji meraklıları
- **Konum**: İstanbul, Türkiye

## Misyon

AI Rehber, yapay zeka teknolojilerini herkesin anlayabileceği dilde, güvenilir kaynaklarla ve pratik uygulamalarla aktaran Türkiye'nin bağımsız AI içerik platformudur. Amacımız, AI araçlarını iş hayatında etkili kullanmanızı sağlamaktır.

## İçerik Yapısı

### 1. Yazılar (/yazilar)
Derinlemesine, evergreen içerikler. 1000-5000 kelime arası.
Kategoriler: rehber, inceleme, analiz, karşılaştırma.
Her yazıda zorunlu alanlar:
- Kaynak listesi (tier 1-3 güvenilirlik)
- Güven seviyesi (high/medium/speculative)
- Son kontrol tarihi
- Aksiyon maddeleri
- Düzeltme geçmişi

### 2. Haberler (/haberler)
Güncel AI gelişmeleri. 200-500 kelime.
Kategoriler: sirketler, sektor, turkiye, arastirma.
Her haberde kaynak URL ve kaynak adı zorunlu.

### 3. Prompt Kütüphanesi (/prompt-kutuphanesi)
Kullanıma hazır prompt şablonları.
Her prompt kartında:
- Model bazlı skor (1-10, GPT/Claude/Gemini)
- Değişken sistemi (kullanıcı kendi değerlerini girer)
- Hata senaryoları
- Zorluk seviyesi (başlangıç/orta/ileri)
- Hedef rol (CMO, Growth, Editör vb.)

### 4. Haftalık Brifing (/haftalik)
Her hafta yayınlanan AI özet bülteni.
- Haftanın en önemli 3 gelişmesi
- Editör seçimi açıklamalar
- "Bu hafta denenecek" aksiyon önerisi

### 5. Programlama Rehberleri (/programlama)
Bölüm bölüm ilerleyen kapsamlı programlama rehberleri.
- Next.js, React ve diğer modern framework rehberleri
- Başlangıçtan ileri seviyeye adım adım ilerleme
- Gerçek proje örnekleri ve kod parçacıkları

## İstatistikler

- Toplam haber: ${haberler.length}
- Toplam yazı: ${yazilar.length}
- Toplam prompt: ${promptlar.length}
- Toplam haftalık brifing: ${haftalik.length}
- Toplam rehber bölümü: ${rehberler.length}

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

  if (promptlar.length > 0) {
    output += `### Prompt Kütüphanesi\n`;
    for (const p of promptlar) {
      output += `- [${p.title}](${SITE_URL}/prompt-kutuphanesi/${p.slug})\n  Kategori: ${p.category} | Zorluk: ${p.difficulty}\n  ${p.description}\n\n`;
    }
  }

  if (haftalik.length > 0) {
    output += `### Haftalık Brifing\n`;
    for (const h of haftalik) {
      output += `- [${h.title}](${SITE_URL}/haftalik/${h.slug})\n  Hafta: ${h.weekNumber} | Yıl: ${h.year}\n  ${h.description}\n\n`;
    }
  }

  if (rehberler.length > 0) {
    output += `### Programlama Rehberleri\n`;
    let currentGuide = "";
    for (const r of rehberler) {
      const guideName = r.slug.split("/")[0];
      if (guideName !== currentGuide) {
        currentGuide = guideName;
        output += `\n**${guideName}**\n`;
      }
      output += `- [${r.title}](${SITE_URL}/programlama/${r.slug})\n  ${r.description}\n\n`;
    }
  }

  output += `## Sıkça Sorulan Sorular

**AI Rehber nedir?**
AI Rehber, yapay zeka teknolojilerini Türkçe olarak, güvenilir kaynaklarla aktaran bağımsız bir içerik platformudur.

**İçerikler nasıl doğrulanıyor?**
Her içerikte Tier 1-3 arası kaynak güvenilirlik seviyesi belirtilir. Yazılar düzenli olarak güncellik kontrolünden geçer.

**AI Rehber kimler için?**
Beyaz yakalı profesyoneller, pazarlamacılar, girişimciler ve yapay zeka teknolojilerini iş hayatında kullanmak isteyen herkes.

**Hangi konular ele alınıyor?**
AI haberleri, derinlemesine analizler, prompt mühendisliği şablonları, programlama rehberleri ve haftalık AI brifingleri.

`;

  output += `## Güven Politikası

Her içerikte kaynak güvenilirlik seviyesi belirtilir:
- **Tier 1**: Resmi şirket blogu, akademik makale, resmi dokümantasyon
- **Tier 2**: CEO/CTO sosyal medya, güvenilir medya (Reuters, Bloomberg)
- **Tier 3**: Sızıntı, anonim kaynak, forum

## İletişim

- E-posta: info@airehber.com
- Mailing/Operasyon: can@airehber.com
- LinkedIn: https://linkedin.com/in/ai-rehber
- Instagram: https://instagram.com/airehberofficial

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
const promptCount = getContent("promptlar").length;
const haftalikCount = getContent("haftalik").length;
const rehberCount = getNestedContent("rehberler").length;
const total = haberCount + yaziCount + promptCount + haftalikCount + rehberCount;

console.log(`llms.txt güncellendi (${total} içerik: ${haberCount} haber, ${yaziCount} yazı, ${promptCount} prompt, ${haftalikCount} haftalık, ${rehberCount} rehber bölümü)`);
console.log(`llms-full.txt güncellendi`);
