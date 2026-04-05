// ─────────────────────────────────────────────────────────────
// AI Rehber — Homepage Data Helpers
// Anasayfa veri hazırlama mantığı (page.tsx'den çıkarıldı)
// ─────────────────────────────────────────────────────────────

import { yazilar, haberler, promptlar, haftalik, rehberler } from "#site/content";

// ─── Types ───

export type HeroItem = {
  title: string;
  description: string;
  slug: string;
  date: string;
  category: string;
  href: string;
  type: "yazi" | "haber";
  readingTime: number;
  editorPick: boolean;
  editorNote?: string;
  image?: string;
  imageAlt?: string;
  imageCredit?: string;
  blurDataURL?: string;
};

export type ExploreSection = {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly count: string;
};

// ─── Filtered & Sorted Data ───

export const publishedYazilar = yazilar
  .filter((y) => y.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const publishedHaberler = haberler
  .filter((h) => h.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const latestBrifing = haftalik
  .filter((h) => h.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

// ─── Hero Item Selection ───

export function getHeroItem(): HeroItem | null {
  const candidates: HeroItem[] = [];

  for (const y of publishedYazilar) {
    candidates.push({
      title: y.title,
      description: y.description,
      slug: y.slug,
      date: y.date,
      category: y.category,
      href: `/yazilar/${y.slug}`,
      type: "yazi",
      readingTime: y.metadata.readingTime,
      editorPick: y.editorPick,
      editorNote: y.editorNote,
      image: y.image,
      imageAlt: y.imageAlt,
      imageCredit: y.imageCredit,
      blurDataURL: y.blurDataURL,
    });
  }

  for (const h of publishedHaberler) {
    candidates.push({
      title: h.title,
      description: h.description,
      slug: h.slug,
      date: h.date,
      category: h.category,
      href: `/haberler/${h.slug}`,
      type: "haber",
      readingTime: h.metadata.readingTime,
      editorPick: h.editorPick,
      editorNote: h.editorNote,
      image: h.image,
      imageAlt: h.imageAlt,
      imageCredit: h.imageCredit,
      blurDataURL: h.blurDataURL,
    });
  }

  if (candidates.length === 0) return null;

  const editorPick = candidates.find((c) => c.editorPick);
  if (editorPick) return editorPick;

  candidates.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return candidates[0];
}

// ─── Section Data Builders ───

export function getRecentPosts(heroItem: HeroItem | null) {
  return publishedYazilar
    .filter(
      (post) => !(heroItem?.type === "yazi" && post.slug === heroItem.slug)
    )
    .slice(0, 8);
}

export function getLatestNews(heroItem: HeroItem | null) {
  return publishedHaberler
    .filter(
      (news) => !(heroItem?.type === "haber" && news.slug === heroItem.slug)
    )
    .slice(0, 8);
}

export function getExploreSections(): readonly ExploreSection[] {
  return [
    {
      title: "Programlama Rehberleri",
      description:
        "Sıfırdan ileri seviyeye, interaktif derslerle programlama öğrenin",
      href: "/programlama",
      count: `${new Set(rehberler.filter((r) => r.published).map((r) => r.guide)).size || "Yeni"}`,
    },
    {
      title: "Prompt Kütüphanesi",
      description: "Kullanıma hazır, model bazlı skorlanmış prompt şablonları",
      href: "/prompt-kutuphanesi",
      count: `${promptlar.filter((p) => p.published).length}+`,
    },
    {
      title: "Haftalık Brifing",
      description: "Her hafta AI dünyasının en önemli 3 gelişmesi",
      href: "/haftalik",
      count: latestBrifing
        ? `W${String(latestBrifing.weekNumber).padStart(2, "0")}`
        : "—",
    },
  ] as const;
}

// ─── FAQ Data ───

export const AI_REHBER_FAQ = [
  {
    question: "AI Rehber nedir?",
    answer:
      "AI Rehber, yapay zeka dünyasındaki güncel haberleri, derinlemesine analizleri ve kullanıma hazır prompt şablonlarını Türkçe olarak sunan bağımsız bir yayın platformudur.",
  },
  {
    question: "Yapay zeka haberleri nereden takip edilir?",
    answer:
      "AI Rehber, OpenAI, Google DeepMind, Anthropic gibi şirketlerin gelişmelerini takip ederek güvenilir kaynaklardan doğrulanmış haberleri Türkçe olarak yayınlar. Haftalık brifing ile önemli gelişmeleri kaçırmazsınız.",
  },
  {
    question: "AI Rehber'deki haberler güvenilir mi?",
    answer:
      "Her haber en az 2 güvenilir kaynakla doğrulanır ve güven seviyesi (yüksek/orta/spekülatif) şeffaf şekilde belirtilir. Orijinal kaynak linkleri her makalenin altında yer alır.",
  },
  {
    question: "Prompt kütüphanesi nasıl kullanılır?",
    answer:
      "Prompt Kütüphanesi'ndeki şablonları doğrudan ChatGPT, Claude veya Gemini'ye kopyalayabilirsiniz. Her prompt, model bazlı performans skorları ve örnek çıktılarla birlikte sunulur.",
  },
];
