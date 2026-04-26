// ─────────────────────────────────────────────────────────────
// feedeep — Site-wide Constants (Single Source of Truth)
// ─────────────────────────────────────────────────────────────

export const SITE = {
  name: "feedeep",
  title: "feedeep — Yazılım ve AI Haberleri",
  slogan: "Akışın dibindeyiz.",
  description:
    "Yapay zeka, yazılım ve web geliştirme dünyasından güncel haberler, derinlemesine analizler ve araç incelemeleri.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://feedeep.com",
  locale: "tr_TR",
  language: "tr",
  author: {
    name: "feedeep Editöryal Ekibi",
    email: "hey@feedeep.com",
    role: "Editöryal Ekip",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/feedeep/",
    instagram: "https://www.instagram.com/feedeepofficial/",
    x: "https://x.com/feedeepofficial",
    substack: "https://substack.com/@feedeep",
  },
  /** ISO 8601 — Proje ilk yayın tarihi (Organization schema) */
  foundingDate: "2025-01-01",
  organization: {
    name: "feedeep",
    logo: "/logo.png",
    logoSquare: "/logo-512.png",
  },
} as const;

export const NAV_ITEMS = [
  { label: "Yazılar", href: "/yazilar" },
  { label: "Haberler", href: "/haberler" },
  { label: "Open Source", href: "/open-source" },
  { label: "Web Scraping", href: "/web-scraping" },
] as const;



// Güncellik rozeti eşikleri (gün bazında)
export const FRESHNESS = {
  fresh: { maxDays: 7, label: "Güncel" },
  stale: { maxDays: 30, label: "Kontrol Gerekli" },
  outdated: { maxDays: Infinity, label: "Eskimiş Olabilir" },
} as const;

// ─── Kategori Haritaları (content type bazlı) ───────────────

export const YAZI_CATEGORIES: Record<string, string> = {
  inceleme: "İnceleme",
  analiz: "Analiz",
  karsilastirma: "Karşılaştırma",
};

export const HABER_CATEGORIES: Record<string, string> = {
  sirketler: "Şirketler",
  sektor: "Sektör",
  turkiye: "Türkiye",
  arastirma: "Araştırma",
};

// ─── Tag Etiket Haritası (hub sayfaları için doğru yazım) ───

export const TAG_LABELS: Record<string, string> = {
  // Şirketler
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  meta: "Meta",
  microsoft: "Microsoft",
  alibaba: "Alibaba",
  nvidia: "NVIDIA",
  apple: "Apple",
  cursor: "Cursor",
  mistral: "Mistral AI",
  bytedance: "ByteDance",
  cloudflare: "Cloudflare",
  figma: "Figma",
  github: "GitHub",
  perplexity: "Perplexity",
  vercel: "Vercel",
  stripe: "Stripe",
  // Konular
  "ai-model": "AI Modelleri",
  "ai-agent": "AI Ajanları",
  "ai-guvenlik": "AI Güvenlik",
  yatirim: "Yatırım",
  kodlama: "Kodlama",
  "acik-kaynak": "Açık Kaynak",
  "kurumsal-ai": "Kurumsal AI",
  erp: "ERP",
  crm: "CRM",
  "is-yazilimi": "İş Yazılımı",
  "ses-gorsel-video": "Ses, Görsel & Video",
  arastirma: "Araştırma",
  turkiye: "Türkiye",
  "is-hayati": "İş Hayatı",
};

/** Tag slug'ından okunabilir etiket adı döndürür */
export function getTagLabel(tag: string): string {
  return TAG_LABELS[tag] ?? tag.replace(/-/g, " ");
}


