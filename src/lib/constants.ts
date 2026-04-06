// ─────────────────────────────────────────────────────────────
// AI Rehber — Site-wide Constants (Single Source of Truth)
// ─────────────────────────────────────────────────────────────

export const SITE = {
  name: "AI Rehber",
  title: "AI Rehber — Yapay Zeka Rehberiniz",
  description:
    "Yapay zeka dünyasının Türkçe rehberi. Güncel haberler, derinlemesine yazılar ve programlama rehberleri.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://airehber.com",
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
  { label: "Programlama", href: "/programlama" },
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

// ─── Programlama Rehberleri ──────────────────────────────────

export const GUIDE_TECHNOLOGIES: Record<string, { label: string; description: string; icon: string; color: string }> = {
  nextjs: {
    label: "Next.js",
    description: "React tabanlı full-stack web framework",
    icon: "▲",
    color: "text-white",
  },
  dart: {
    label: "Dart & Flutter",
    description: "Google'ın çapraz platform mobil geliştirme dili",
    icon: "◆",
    color: "text-blue-400",
  },
  python: {
    label: "Python",
    description: "Yapay zeka ve veri bilimi için en popüler dil",
    icon: "🐍",
    color: "text-yellow-400",
  },
  react: {
    label: "React",
    description: "Meta'nın UI kütüphanesi",
    icon: "⚛",
    color: "text-cyan-400",
  },
};

