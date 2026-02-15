// ─────────────────────────────────────────────────────────────
// AI Rehber — Site-wide Constants (Single Source of Truth)
// ─────────────────────────────────────────────────────────────

export const SITE = {
  name: "AI Rehber",
  title: "AI Rehber — Yapay Zeka Rehberiniz",
  description:
    "Yapay zeka dünyasının Türkçe rehberi. Güncel haberler, derinlemesine yazılar, prompt kütüphanesi ve AI model karşılaştırmaları.",
  url: "https://airehber.com",
  locale: "tr_TR",
  language: "tr",
  author: {
    name: "Can Demir",
    email: "info@airehber.com",
    role: "Editör & Growth Hacking Specialist",
    linkedin: "https://linkedin.com/in/ai-rehber",
    instagram: "https://instagram.com/airehberofficial",
  },
  organization: {
    name: "AI Rehber",
    logo: "/logo.png",
    logoSquare: "/logo-512.png",
  },
} as const;

export const NAV_ITEMS = [
  { label: "Yazılar", href: "/yazilar" },
  { label: "Haberler", href: "/haberler" },
  { label: "Prompt Kütüphanesi", href: "/prompt-kutuphanesi" },
  { label: "Hakkımızda", href: "/hakkimizda" },
] as const;



// Güncellik rozeti eşikleri (gün bazında)
export const FRESHNESS = {
  fresh: { maxDays: 7, label: "Güncel" },
  stale: { maxDays: 30, label: "Kontrol Gerekli" },
  outdated: { maxDays: Infinity, label: "Eskimiş Olabilir" },
} as const;

// ─── Kategori Haritaları (content type bazlı) ───────────────

export const YAZI_CATEGORIES: Record<string, string> = {
  rehber: "Rehber",
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

export const PROMPT_CATEGORIES: Record<string, string> = {
  "icerik-uretim": "İçerik Üretim",
  kod: "Kod",
  analiz: "Analiz",
  pazarlama: "Pazarlama",
  egitim: "Eğitim",
  genel: "Genel",
};

// Difficulty levels for prompts
export const DIFFICULTY: Record<string, string> = {
  baslangic: "Başlangıç",
  orta: "Orta",
  ileri: "İleri",
};
