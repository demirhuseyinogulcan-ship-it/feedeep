// ─────────────────────────────────────────────────────────────
// AI Rehber — Anasayfa
// "The Void speaks in light."
// Wide desktop layout · Side-by-side hero · Card grids
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { JsonLd } from "@/components/seo/json-ld";
import { websiteJsonLd, generateMeta } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { SITE, YAZI_CATEGORIES, HABER_CATEGORIES } from "@/lib/constants";
import {
  getHeroItem,
  getRecentPosts,
  getLatestNews,
} from "@/lib/homepage";
import { NewsletterForm } from "@/components/shared/newsletter-form";
import { ContinueReadingBanner } from "@/components/shared/continue-reading-banner";
import { NewsTicker } from "@/components/shared/the-signal";
import { TiltCard } from "@/components/shared/tilt-card";

export const metadata: Metadata = generateMeta({
  title: SITE.title,
  description: SITE.description,
  path: "/",
  canonicalPath: "/",
});

// ─── Veri hazırlığı ───
const heroItem = getHeroItem();
const recentPosts = getRecentPosts(heroItem);
const latestNews = getLatestNews(heroItem);

export default function HomePage() {
  const heroCategory = heroItem
    ? heroItem.type === "yazi"
      ? YAZI_CATEGORIES[heroItem.category] ?? heroItem.category
      : HABER_CATEGORIES[heroItem.category] ?? heroItem.category
    : "";

  return (
    <>
      <JsonLd data={[websiteJsonLd()]} />

      {/* ─── Kaldığın Yerden Devam Et ─── */}
      <ContinueReadingBanner />

      {/* ─── Gündem: Kayan Haber Şeridi ─── */}
      <NewsTicker />

      {/* ─── Hero: Editörün Seçimi ─── */}
      {heroItem && (
        <section className="relative mx-auto max-w-5xl px-4 sm:px-8 pt-12 sm:pt-20 pb-20">
          {/* Floating ambient orb */}
          <div
            aria-hidden="true"
            className="absolute -top-32 right-0 w-[500px] h-[500px] rounded-full animate-float pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)",
            }}
          />

          {/* Desktop: side-by-side layout (metin sol, görsel sağ) */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center animate-fade-up">
            {/* Sol: metin içeriği */}
            <div>
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

              <Link href={heroItem.href} className="group block">
                <h1
                  className="font-bold tracking-tight text-gray-100 leading-[1.05] text-glow"
                  style={{ fontSize: "clamp(1.75rem, 2.5vw, 2.5rem)" }}
                >
                  {heroItem.title}
                </h1>
              </Link>

              <p className="mt-6 text-sm text-gray-500 leading-relaxed max-w-md">
                {heroItem.description}
              </p>

              {heroItem.editorNote && (
                <p className="mt-4 text-xs text-gray-600 italic leading-relaxed max-w-sm">
                  &ldquo;{heroItem.editorNote}&rdquo;
                </p>
              )}

              <div className="mt-6 flex items-center gap-4">
                <Link
                  href={heroItem.href}
                  className="text-sm font-medium text-gray-200 hover:text-primary-400 transition-colors"
                >
                  {heroItem.type === "haber" ? "Haberi oku" : "Yazıyı oku"} &rarr;
                </Link>
                <span className="text-gray-800">—</span>
                <span className="text-[11px] text-gray-600">
                  {formatDate(heroItem.date)}
                </span>
              </div>
            </div>

            {/* Sağ: görsel */}
            {heroItem.image ? (
              <div>
                <Link href={heroItem.href} className="group block">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={heroItem.image}
                      alt={heroItem.imageAlt ?? heroItem.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 480px"
                      {...(heroItem.blurDataURL ? { placeholder: "blur" as const, blurDataURL: heroItem.blurDataURL } : {})}
                    />
                  </div>
                </Link>
              </div>
            ) : (
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-surface-1 void-grid">
                <div
                  className="absolute inset-0 animate-breathe"
                  style={{
                    background: "radial-gradient(ellipse at 40% 60%, rgba(139,92,246,0.08) 0%, transparent 60%)",
                  }}
                />
              </div>
            )}
          </div>

          {/* Mobile/Tablet: stacked layout (mevcut tasarım) */}
          <div className="lg:hidden animate-fade-up">
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
            </div>

            <Link href={heroItem.href} className="group block">
              <h1
                className="font-bold tracking-tight text-gray-100 leading-[1.05] text-glow"
                style={{ fontSize: "clamp(1.5rem, 5vw, 2.25rem)" }}
              >
                {heroItem.title}
              </h1>
            </Link>

            <p className="mt-6 text-sm text-gray-500 leading-relaxed">
              {heroItem.description}
            </p>

            {heroItem.image && (
              <div className="mt-8">
                <Link href={heroItem.href} className="group block">
                  <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={heroItem.image}
                      alt={heroItem.imageAlt ?? heroItem.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="100vw"
                      {...(heroItem.blurDataURL ? { placeholder: "blur" as const, blurDataURL: heroItem.blurDataURL } : {})}
                    />
                  </div>
                </Link>
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <Link
                href={heroItem.href}
                className="text-sm font-medium text-gray-200 hover:text-primary-400 transition-colors"
              >
                {heroItem.type === "haber" ? "Haberi oku" : "Yazıyı oku"} &rarr;
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
      <div className="line-void mx-auto max-w-5xl animate-line-reveal" />

      {/* ─── Son Haberler — 2 sütunlu kart grid ─── */}
      {latestNews.length > 0 && (
      <section className="mx-auto max-w-5xl px-4 sm:px-8 py-16">
        <div className="flex items-center justify-between mb-10 animate-fade-up">
          <h2 className="text-[11px] font-mono font-semibold tracking-widest uppercase text-gray-500">
            Son Haberler
          </h2>
        </div>

        {/* Desktop: 2-column card grid */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-6">
          {latestNews.map((news, i) => (
            <TiltCard
              key={news.slug}
              className="group animate-fade-up"
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              <Link
                href={`/haberler/${news.slug}`}
                className="block p-4"
              >
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 w-24 h-[68px] relative rounded-lg overflow-hidden">
                    {news.image ? (
                      <Image
                        src={news.image}
                        alt={news.imageAlt ?? news.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="96px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-surface-1 void-grid">
                        <div className="absolute inset-0 animate-breathe" style={{ background: "radial-gradient(ellipse at 40% 60%, rgba(139,92,246,0.1) 0%, transparent 60%)" }} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-mono tracking-widest uppercase text-gray-600">
                        {news.sourceName}
                      </span>
                      <span className="text-[10px] text-gray-800">
                        {formatDate(news.date)}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-200 group-hover:text-gray-100 transition-colors leading-snug text-glow">
                      {news.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </TiltCard>
          ))}
        </div>

        {/* Mobile: compact list with thumbnail */}
        <div className="sm:hidden space-y-4">
          {latestNews.map((news, i) => (
            <Link
              key={news.slug}
              href={`/haberler/${news.slug}`}
              className="group flex gap-3 items-start animate-fade-up"
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              <div className="shrink-0 w-16 h-12 relative rounded-lg overflow-hidden">
                {news.image ? (
                  <Image
                    src={news.image}
                    alt={news.imageAlt ?? news.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-surface-1 void-grid">
                    <div className="absolute inset-0 animate-breathe" style={{ background: "radial-gradient(ellipse at 40% 60%, rgba(139,92,246,0.1) 0%, transparent 60%)" }} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-gray-600">
                    {news.sourceName}
                  </span>
                  <span className="text-[10px] text-gray-800">
                    {formatDate(news.date)}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-200 group-hover:text-gray-100 transition-colors leading-snug text-glow">
                  {news.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Tümünü Gör butonu */}
        <div className="mt-10 text-center animate-fade-up delay-300">
          <Link
            href="/haberler"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] hover:border-white/[0.12] px-6 py-3 text-sm font-medium text-gray-400 hover:text-gray-200 transition-all"
          >
            Tüm Haberleri Gör &rarr;
          </Link>
        </div>
      </section>
      )}

      {/* Hair-line */}
      <div className="line-void mx-auto max-w-5xl animate-line-reveal delay-200" />

      {/* ─── Son Yazılar — 2 sütunlu kart grid (haberlerle aynı) ─── */}
      {recentPosts.length > 0 && (
      <section className="mx-auto max-w-5xl px-4 sm:px-8 py-16">
        <div className="flex items-center justify-between mb-10 animate-fade-up">
          <h2 className="text-[11px] font-mono font-semibold tracking-widest uppercase text-gray-500">
            Son Yazılar
          </h2>
        </div>

        {/* Desktop: 2-column card grid */}
        <div className="hidden sm:grid sm:grid-cols-2 gap-6">
          {recentPosts.map((post, i) => (
            <TiltCard
              key={post.slug}
              className="group animate-fade-up"
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              <Link
                href={`/yazilar/${post.slug}`}
                className="block p-4"
              >
                <div className="flex gap-4 items-start">
                  <div className="shrink-0 w-24 h-[68px] relative rounded-lg overflow-hidden">
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.imageAlt ?? post.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="96px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-surface-1 void-grid">
                        <div className="absolute inset-0 animate-breathe" style={{ background: "radial-gradient(ellipse at 40% 60%, rgba(139,92,246,0.1) 0%, transparent 60%)" }} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-mono tracking-widest uppercase text-primary-400/50">
                        {YAZI_CATEGORIES[post.category] ?? post.category}
                      </span>
                      <span className="text-[10px] text-gray-800">
                        {formatDate(post.date)}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-200 group-hover:text-gray-100 transition-colors leading-snug text-glow">
                      {post.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </TiltCard>
          ))}
        </div>

        {/* Mobile: compact list with thumbnail */}
        <div className="sm:hidden space-y-4">
          {recentPosts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/yazilar/${post.slug}`}
              className="group flex gap-3 items-start animate-fade-up"
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              <div className="shrink-0 w-16 h-12 relative rounded-lg overflow-hidden">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.imageAlt ?? post.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-surface-1 void-grid">
                    <div className="absolute inset-0 animate-breathe" style={{ background: "radial-gradient(ellipse at 40% 60%, rgba(139,92,246,0.1) 0%, transparent 60%)" }} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono tracking-widest uppercase text-primary-400/50">
                    {YAZI_CATEGORIES[post.category] ?? post.category}
                  </span>
                  <span className="text-[10px] text-gray-800">
                    {formatDate(post.date)}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-200 group-hover:text-gray-100 transition-colors leading-snug text-glow">
                  {post.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>

        {/* Tümünü Gör butonu */}
        <div className="mt-10 text-center animate-fade-up delay-300">
          <Link
            href="/yazilar"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] hover:border-white/[0.12] px-6 py-3 text-sm font-medium text-gray-400 hover:text-gray-200 transition-all"
          >
            Tüm Yazıları Gör &rarr;
          </Link>
        </div>
      </section>
      )}

      {/* Hair-line */}
      <div className="line-void mx-auto max-w-5xl animate-line-reveal delay-300" />

      {/* ─── İç Çember — Newsletter ─── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-8 py-20 animate-fade-up delay-300">
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
