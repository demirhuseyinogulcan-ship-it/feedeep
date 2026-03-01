// ─────────────────────────────────────────────────────────────
// AI Rehber — Anasayfa
// "The Void speaks in light."
// Massive typography · Numbered editorial · Ambient void
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { websiteJsonLd, faqJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { YAZI_CATEGORIES, HABER_CATEGORIES } from "@/lib/constants";
import { yazilar, haberler, promptlar, haftalik } from "#site/content";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { ContinueReadingBanner } from "@/components/shared/continue-reading-banner";
import { NewsTicker } from "@/components/shared/the-signal";
import { StatsStrip } from "@/components/shared/stats-strip";

// ─── Velite verilerini hazırla ───

const publishedYazilar = yazilar
  .filter((y) => y.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const publishedHaberler = haberler
  .filter((h) => h.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Hero: Siteye en son eklenen içerik (yazı veya haber — hangisi daha yeniyse)
type HeroItem = {
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
};

function getHeroItem(): HeroItem | null {
  const candidates: HeroItem[] = [];

  // Tüm yayınlanmış içerikleri topla
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
    });
  }

  if (candidates.length === 0) return null;

  // Editörün seçimi varsa onu tercih et, yoksa en yeni tarihe sahip olanı seç
  const editorPick = candidates.find((c) => c.editorPick);
  if (editorPick) return editorPick;

  candidates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return candidates[0];
}

const heroItem = getHeroItem();

// ─── FAQ — SEO Rich Snippet + Kullanıcı bilgilendirme ───
const AI_REHBER_FAQ = [
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

// Son Yazılar — hero'da yazı varsa aynı slug'ı çıkar, en güncel 3'ü göster
const recentPosts = publishedYazilar
  .filter((post) => !(heroItem?.type === "yazi" && post.slug === heroItem.slug))
  .slice(0, 3);

// Son Haberler — hero'da haber varsa aynı slug'ı çıkar, en güncel 5'i göster
const latestNews = publishedHaberler
  .filter((news) => !(heroItem?.type === "haber" && news.slug === heroItem.slug))
  .slice(0, 5);

const latestBrifing = haftalik
  .filter((h) => h.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

const EXPLORE_SECTIONS = [
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
    count: latestBrifing ? `W${String(latestBrifing.weekNumber).padStart(2, "0")}` : "—",
  },
] as const;

export default function HomePage() {
  const heroCategory = heroItem
    ? heroItem.type === "yazi"
      ? YAZI_CATEGORIES[heroItem.category] ?? heroItem.category
      : HABER_CATEGORIES[heroItem.category] ?? heroItem.category
    : "";

  return (
    <>
      <JsonLd
        data={[
          websiteJsonLd(),
          faqJsonLd(AI_REHBER_FAQ),
        ]}
      />

      {/* ─── Kaldığın Yerden Devam Et ─── */}
      <ContinueReadingBanner />

      {/* ─── Gündem: Kayan Haber Şeridi ─── */}
      <NewsTicker />

      {/* ─── Hero: Editörün Seçimi ─── */}
      {heroItem && (
        <section className="relative mx-auto max-w-3xl px-4 sm:px-6 pt-12 sm:pt-20 pb-20">
          {/* Floating ambient orb */}
          <div
            aria-hidden="true"
            className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full animate-float pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
            }}
          />

          <div className="animate-fade-up">
            <div className="flex items-center gap-3 mb-6">
              {heroItem.editorPick && (
                <>
                  <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-gray-500">
                    Editörün Seçimi
                  </span>
                  <span className="text-[11px] text-gray-800">/</span>
                </>
              )}
              <span className="text-[11px] font-mono tracking-widest uppercase text-primary-400/80">
                {heroCategory}
              </span>
              <span className="text-[11px] text-gray-600">/</span>
              <span className="text-[11px] font-mono tracking-wider text-gray-600">
                {heroItem.readingTime} dk
              </span>
              {heroItem.type === "haber" && (
                <>
                  <span className="text-[11px] text-gray-600">/</span>
                  <span className="text-[10px] font-mono tracking-wider text-primary-500/60 uppercase">
                    Haber
                  </span>
                </>
              )}
            </div>

            <Link
              href={heroItem.href}
              className="group block"
            >
              <h1
                className="font-bold tracking-tight text-gray-100 leading-[0.95] text-glow"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
              >
                {heroItem.title}
              </h1>
            </Link>

            <p className="mt-8 text-sm text-gray-500 leading-relaxed max-w-md animate-fade-up delay-200">
              {heroItem.description}
            </p>

            {heroItem.editorNote && (
              <p className="mt-4 text-xs text-gray-600 italic leading-relaxed max-w-sm animate-fade-up delay-200">
                &ldquo;{heroItem.editorNote}&rdquo;
              </p>
            )}

            <div className="mt-6 flex items-center gap-4 animate-fade-up delay-300">
              <Link
                href={heroItem.href}
                className="text-sm font-medium text-gray-200 hover:text-primary-400 transition-colors"
              >
                {heroItem.type === "haber" ? "Haberi oku" : "Yazıyı oku"}
              </Link>
              <span className="text-gray-800">—</span>
              <span className="text-[11px] text-gray-600">
                {formatDate(heroItem.date)}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Hair-line */}
      <div className="line-void mx-auto max-w-3xl animate-line-reveal" />

      {/* ─── Son Haberler — Stacked titles ─── */}
      {latestNews.length > 0 && (
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-10 animate-fade-up">
          <h2 className="text-[11px] font-mono font-semibold tracking-widest uppercase text-gray-500">
            Son Haberler
          </h2>
          <Link
            href="/haberler"
            className="text-[11px] font-mono tracking-wider text-gray-600 hover:text-primary-400 transition-colors"
          >
            Tümü
          </Link>
        </div>

        {/* Mobile: vertical stack, Desktop: stacked */}
        <div className="sm:hidden space-y-5">
          {latestNews.map((news, i) => (
            <Link
              key={news.slug}
              href={`/haberler/${news.slug}`}
              className="group block animate-fade-up"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-gray-600">
                  {news.sourceName}
                </span>
                <span className="text-[10px] text-gray-800">
                  {formatDate(news.date)}
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-200 group-hover:text-gray-100 transition-colors leading-snug text-glow">
                {news.title}
              </h3>
            </Link>
          ))}
        </div>

        <div className="hidden sm:block space-y-0">
          {latestNews.map((news, i) => (
            <Link
              key={news.slug}
              href={`/haberler/${news.slug}`}
              className="group block py-5 animate-fade-up"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-gray-600">
                  {news.sourceName}
                </span>
                <span className="text-[10px] text-gray-800">
                  {formatDate(news.date)}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-200 group-hover:text-gray-100 transition-colors text-glow">
                {news.title}
              </h3>
            </Link>
          ))}
        </div>
      </section>
      )}

      {/* Hair-line */}
      <div className="line-void mx-auto max-w-3xl animate-line-reveal delay-200" />

      {/* ─── Son Yazılar — Stacked Titles ─── */}
      {recentPosts.length > 0 && (
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-10 animate-fade-up">
          <h2 className="text-[11px] font-mono font-semibold tracking-widest uppercase text-gray-500">
            Son Yazılar
          </h2>
          <Link
            href="/yazilar"
            className="text-[11px] font-mono tracking-wider text-gray-600 hover:text-primary-400 transition-colors"
          >
            Tümü
          </Link>
        </div>

        {/* Mobile: vertical stack, Desktop: stacked */}
        <div className="sm:hidden space-y-6">
          {recentPosts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/yazilar/${post.slug}`}
              className="group block animate-fade-up"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-primary-400/50">
                  {YAZI_CATEGORIES[post.category] ?? post.category}
                </span>
                <span className="text-[10px] text-gray-800">
                  {formatDate(post.date)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-200 group-hover:text-gray-100 transition-colors leading-tight text-glow">
                {post.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {post.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="hidden sm:block space-y-8">
          {recentPosts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/yazilar/${post.slug}`}
              className="group block animate-fade-up"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-primary-400/50">
                  {YAZI_CATEGORIES[post.category] ?? post.category}
                </span>
                <span className="text-[10px] text-gray-800">
                  {formatDate(post.date)}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-200 group-hover:text-gray-100 transition-colors leading-tight text-glow">
                {post.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 max-w-lg leading-relaxed">
                {post.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
      )}

      {/* Hair-line */}
      <div className="line-void mx-auto max-w-3xl animate-line-reveal delay-300" />

      {/* ─── Keşfet — Minimal row links ─── */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <h2 className="text-[11px] font-mono font-semibold tracking-widest uppercase text-gray-500 mb-10 animate-fade-up">
          Keşfet
        </h2>

        {/* Mobile: vertical stack, Desktop: rows */}
        <div className="sm:hidden space-y-5">
          {EXPLORE_SECTIONS.map((section, i) => (
            <Link
              key={section.href}
              href={section.href}
              className="group block animate-fade-up"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <span className="text-[11px] font-mono tracking-wider text-gray-700 group-hover:text-primary-400 transition-colors">
                {section.count}
              </span>
              <h3 className="mt-1.5 text-lg font-semibold text-gray-200 group-hover:text-primary-400 transition-colors text-glow">
                {section.title}
              </h3>
              <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                {section.description}
              </p>
            </Link>
          ))}
        </div>

        <div className="hidden sm:block space-y-0">
          {EXPLORE_SECTIONS.map((section, i) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex items-center justify-between py-5 animate-fade-up"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-200 group-hover:text-primary-400 transition-colors text-glow">
                  {section.title}
                </h3>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">
                  {section.description}
                </p>
              </div>
              <span className="text-[11px] font-mono tracking-wider text-gray-700 group-hover:text-primary-400 transition-colors flex-shrink-0 ml-8">
                {section.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Hair-line */}
      <div className="line-void mx-auto max-w-3xl animate-line-reveal delay-400" />

      {/* ─── SSS (FAQ) — SEO Rich Snippet ─── */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 animate-fade-up delay-200">
        <h2 className="text-xs font-mono tracking-widest uppercase text-gray-600 mb-8">
          Sıkça Sorulan Sorular
        </h2>
        <div className="space-y-6">
          {AI_REHBER_FAQ.map((faq, i) => (
            <details
              key={i}
              className="group border border-white/[0.04] rounded-lg"
            >
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-medium text-gray-300 hover:text-gray-100 transition-colors">
                {faq.question}
                <span className="text-gray-700 group-open:rotate-45 transition-transform duration-200 text-lg">
                  +
                </span>
              </summary>
              <p className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Hair-line */}
      <div className="line-void mx-auto max-w-3xl animate-line-reveal delay-400" />

      {/* ─── Sayılarla AI Rehber — Sosyal Kanıt ─── */}
      <StatsStrip />

      {/* Hair-line */}
      <div className="line-void mx-auto max-w-3xl animate-line-reveal delay-500" />

      {/* ─── İç Çember — Newsletter ─── */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-20 animate-fade-up delay-300">
        <div className="max-w-sm">
          <h2 className="text-xl font-bold text-gray-100">
            İç Çember
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Her Pazartesi — sadece abonelere özel yapay zeka fırsatları
            ve para kazanma ipuçları. Doğrudan e-posta kutunuza.
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
