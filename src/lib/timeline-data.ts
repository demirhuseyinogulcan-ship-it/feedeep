// ─────────────────────────────────────────────────────────────
// AI Rehber — Editoryal Zaman Çizelgesi Verileri
// Velite dışı, manuel eklenen timeline kayıtları.
// Yeni kayıt eklemek için bu dosyaya yeni obje ekleyin.
// ─────────────────────────────────────────────────────────────

export interface TimelineEntry {
  date: string;
  company: string;
  title: string;
  url: string;
}

export const EDITORIAL_TIMELINE: TimelineEntry[] = [
  {
    date: "2026-02-14",
    company: "Airbnb",
    title: "Müşteri desteğinin %33'ü artık AI tarafından yönetiliyor",
    url: "https://techcrunch.com/2026/02/13/airbnb-says-a-third-of-its-customer-support-is-now-handled-by-ai-in-the-u-s-and-canada/",
  },
  {
    date: "2026-02-13",
    company: "xAI",
    title: "Toplu istifa dalgası — kurucu ortaklar ayrılıyor",
    url: "https://www.theverge.com/ai-artificial-intelligence/878761/mass-exodus-at-xai-grok-elon-musk-restructuring",
  },
];
