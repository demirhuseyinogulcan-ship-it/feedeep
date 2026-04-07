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
    linkedin: "https://linkedin.com",
    instagram: "https://instagram.com/feedeepcom",
  },
  organization: {
    name: "feedeep",
    logo: "/logo.png",
    logoSquare: "/logo-512.png",
  },
} as const;

export const NAV_ITEMS = [
  { label: "Yazılar", href: "/yazilar" },
  { label: "Haberler", href: "/haberler" },
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


