// AI Rehber — Sayılarla AI Rehber: Sosyal Kanıt Şeridi
// Toplam haber, yazı, prompt ve benzersiz kaynak sayılarını gösterir

import { yazilar, haberler, promptlar } from "#site/content";

function getStats() {
  const publishedYazilar = yazilar.filter((y) => y.published);
  const publishedHaberler = haberler.filter((h) => h.published);
  const publishedPromptlar = promptlar.filter((p) => p.published);

  // Benzersiz kaynak URL sayısı
  const sourceUrls = new Set<string>();
  for (const y of publishedYazilar) {
    for (const s of y.sources) sourceUrls.add(s.url);
  }
  for (const h of publishedHaberler) {
    for (const s of h.sources) sourceUrls.add(s.url);
  }

  return {
    haberler: publishedHaberler.length,
    yazilar: publishedYazilar.length,
    promptlar: publishedPromptlar.length,
    kaynaklar: sourceUrls.size,
  };
}

export function StatsStrip() {
  const stats = getStats();

  const items = [
    { value: stats.haberler, label: "Haber" },
    { value: stats.yazilar, label: "Yazı" },
    { value: stats.promptlar, label: "Prompt" },
    { value: stats.kaynaklar, label: "Kaynak" },
  ];

  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 animate-fade-up">
      <h2 className="text-[11px] font-mono font-semibold tracking-widest uppercase text-gray-500 mb-10">
        Sayılarla AI Rehber
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
        {items.map((item) => (
          <div key={item.label}>
            <span className="block text-2xl font-bold text-gray-200 font-mono">
              {item.value}
            </span>
            <span className="text-[10px] font-mono tracking-widest uppercase text-gray-600 mt-1">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
