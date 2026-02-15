// ─────────────────────────────────────────────────────────────
// AI Rehber — Anasayfa
// "The Void speaks in light."
// Massive typography · Numbered editorial · Ambient void
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { websiteJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { YAZI_CATEGORIES } from "@/lib/constants";
import { yazilar, haberler, promptlar, kartlar, haftalik } from "#site/content";
import { NewsletterForm } from "@/components/shared/newsletter-form";

// ─── Velite verilerini hazırla ───

const publishedYazilar = yazilar
  .filter((y) => y.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const featuredPost = publishedYazilar[0];
// Eğer sadece 1 yazı varsa, featured'da göster ama Son Yazılar'da da listele
const recentPosts = publishedYazilar.length > 1
  ? publishedYazilar.slice(1, 4)
  : publishedYazilar.slice(0, 3);

const latestNews = haberler
  .filter((h) => h.published)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 3);

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
    title: "AI Model Kartları",
    description: "Fiyat, benchmark ve karşılaştırma bilgi kartları",
    href: "/modeller",
    count: `${kartlar.filter((k) => k.published).length}+`,
  },
  {
    title: "Haftalık Brifing",
    description: "Her hafta AI dünyasının en önemli 3 gelişmesi",
    href: "/haftalik",
    count: latestBrifing ? `W${String(latestBrifing.weekNumber).padStart(2, "0")}` : "—",
  },
] as const;

export default function HomePage() {
  const categoryLabel = featuredPost
    ? YAZI_CATEGORIES[featuredPost.category] ?? featuredPost.category
    : "";

  return (
    <>
      <JsonLd data={websiteJsonLd()} />

      {/* ─── Hero: Massive Typography ─── */}
      {featuredPost && (
        <section className="relative mx-auto max-w-3xl px-4 sm:px-6 pt-16 sm:pt-24 pb-20">
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
              <span className="text-[11px] font-mono tracking-widest uppercase text-primary-400/80">
                {categoryLabel}
              </span>
              <span className="text-[11px] text-gray-600">/</span>
              <span className="text-[11px] font-mono tracking-wider text-gray-600">
                {featuredPost.metadata.readingTime} dk
              </span>
            </div>

            <Link
              href={`/yazilar/${featuredPost.slug}`}
              className="group block"
            >
              <h1
                className="font-bold tracking-tight text-gray-100 leading-[0.95] text-glow"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
              >
                {featuredPost.title}
              </h1>
            </Link>

            <p className="mt-8 text-sm text-gray-500 leading-relaxed max-w-md animate-fade-up delay-200">
              {featuredPost.description}
            </p>

            <div className="mt-6 flex items-center gap-4 animate-fade-up delay-300">
              <Link
                href={`/yazilar/${featuredPost.slug}`}
                className="text-sm font-medium text-gray-200 hover:text-primary-400 transition-colors"
              >
                Yazıyı oku
              </Link>
              <span className="text-gray-800">—</span>
              <span className="text-[11px] text-gray-600">
                {formatDate(featuredPost.date)}
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

        {/* Mobile: horizontal scroll, Desktop: stacked */}
        <div className="sm:hidden flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {latestNews.map((news, i) => (
            <Link
              key={news.slug}
              href={`/haberler/${news.slug}`}
              className="group flex-shrink-0 w-[280px] snap-start animate-fade-up"
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

        {/* Mobile: horizontal scroll, Desktop: stacked */}
        <div className="sm:hidden flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {recentPosts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/yazilar/${post.slug}`}
              className="group flex-shrink-0 w-[280px] snap-start animate-fade-up"
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

        {/* Mobile: horizontal scroll, Desktop: rows */}
        <div className="sm:hidden flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {EXPLORE_SECTIONS.map((section, i) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex-shrink-0 w-[240px] snap-start animate-fade-up"
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

      {/* ─── Newsletter — Floating in the void ─── */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-20 animate-fade-up delay-300">
        <div className="max-w-sm">
          <h2 className="text-xl font-bold text-gray-100">
            Haftalık AI Brifing
          </h2>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
            Her Pazartesi, yapay zeka dünyasındaki en önemli 3 gelişme.
            Doğrudan e-posta kutunuza.
          </p>
          <div className="mt-6">
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
