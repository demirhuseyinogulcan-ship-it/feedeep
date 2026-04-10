// ─────────────────────────────────────────────────────────────
// feedeep — Yazar Sayfası: Can Demir (E-E-A-T)
// Google E-E-A-T sinyali: Deneyim, Uzmanlık, Otorite, Güven
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { generateMeta, breadcrumbJsonLd, personJsonLd, profilePageJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { yazilar, haberler } from "#site/content";
import { sortContent } from "@/lib/content-order";

export const metadata: Metadata = generateMeta({
  title: `${SITE.author.name} — Kurucu & Editör`,
  description: `${SITE.author.name}, feedeep'in kurucusu ve baş editörüdür. Yapay zeka teknolojileri, growth hacking ve dijital içerik stratejisi alanlarında çalışmaktadır.`,
  path: "/yazar/can-demir",
});

// ─── Uzmanlık Alanları ───

const UZMANLIKLAR = [
  {
    alan: "Yapay Zeka Teknolojileri",
    detay: "LLM ekosistemi, prompt mühendisliği, AI ajan mimarileri ve model karşılaştırmaları konularında editoryal içerik üretimi.",
  },
  {
    alan: "Growth Hacking & Dijital Strateji",
    detay: "SEO, içerik stratejisi, kullanıcı edinimi ve dijital pazarlama alanlarında stratejik planlama ve uygulama.",
  },
  {
    alan: "İçerik Mühendisliği",
    detay: "Türkçe teknik içerik üretimi, kaynak doğrulama sistemi, güvenilirlik katmanları ve editoryal standartlar geliştirme.",
  },
  {
    alan: "Web Geliştirme",
    detay: "Next.js, React, TypeScript ve modern web teknolojileri ile performans odaklı uygulama geliştirme.",
  },
] as const;

// ─── Sayfa ───

export default function YazarCanDemirPage() {
  // Son 5 yazı ve 5 haber
  const sonYazilar = sortContent(yazilar).slice(0, 5);

  const sonHaberler = sortContent(haberler).slice(0, 5);

  const toplamIcerik = yazilar.length + haberler.length;

  return (
    <>
      <JsonLd
        data={[
          profilePageJsonLd({
            dateCreated: "2025-01-01",
            dateModified: new Date().toISOString().split("T")[0],
            mainEntity: personJsonLd({
              name: SITE.author.name,
              url: `${SITE.url}/yazar/can-demir`,
              jobTitle: SITE.author.role,
              description: `${SITE.author.name}, feedeep'in kurucusu ve baş editörüdür. Yapay zeka, growth hacking ve dijital içerik stratejisi alanlarında çalışmaktadır.`,
              sameAs: [SITE.author.linkedin, SITE.author.instagram],
              worksFor: SITE.organization.name,
            }),
          }),
          breadcrumbJsonLd([
            { name: "Ana Sayfa", href: "/" },
            { name: "Yazar", href: "/yazar/can-demir" },
            { name: SITE.author.name, href: "/yazar/can-demir" },
          ]),
        ]}
      />

      <section className="mx-auto max-w-[640px] px-4 sm:px-0 py-10">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: SITE.author.name, href: "/yazar/can-demir" },
          ]}
        />

        {/* ─── Profil ─── */}
        <PageHeader
          title={SITE.author.name}
          description={`${SITE.author.role} — feedeep'in kurucusu ve baş editörü. Yapay zeka teknolojilerini herkesin anlayabileceği dilde, güvenilir kaynaklarla aktarıyor.`}
        />

        {/* ─── Biyografi ─── */}
        <div className="animate-fade-up delay-100">
          <span className="text-[11px] font-sans tracking-widest uppercase text-primary-400/80 mb-4 block">
            Hakkında
          </span>
          <div className="space-y-3 text-sm text-gray-400 leading-relaxed max-w-lg">
            <p>
              feedeep, yapay zeka alanındaki gelişmeleri Türkçe olarak, bağımsız
              ve güvenilir bir şekilde aktarmak amacıyla kurulmuştur. Platformda
              yayınlanan tüm içerikler, kaynak doğrulama ve güven katmanı
              sisteminden geçerek okuyucuya ulaşır.
            </p>
            <p>
              Can Demir, growth hacking ve dijital strateji alanındaki deneyimini
              içerik mühendisliği ile birleştirerek, Türkiye&apos;nin yapay zeka
              ekosisteminde güvenilir bir referans noktası oluşturmayı hedefliyor.
            </p>
          </div>
        </div>

        {/* ─── Çizgi ─── */}
        <div className="line-void my-12 animate-line-reveal" />

        {/* ─── Uzmanlık Alanları ─── */}
        <div className="animate-fade-up delay-200">
          <span className="text-[11px] font-sans tracking-widest uppercase text-gray-500 mb-8 block">
            Uzmanlik Alanlari
          </span>

          <div className="space-y-0">
            {UZMANLIKLAR.map((uzmanlik, i) => (
              <div
                key={uzmanlik.alan}
                className="group py-5 animate-fade-up"
                style={{ animationDelay: `${(i + 3) * 80}ms` }}
              >
                <h3 className="text-lg font-semibold text-gray-200 group-hover:text-gray-100 transition-colors text-glow">
                  {uzmanlik.alan}
                </h3>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed max-w-lg">
                  {uzmanlik.detay}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Çizgi ─── */}
        <div className="line-void my-12 animate-line-reveal delay-300" />

        {/* ─── İstatistikler ─── */}
        <div className="animate-fade-up delay-300">
          <span className="text-[11px] font-sans tracking-widest uppercase text-gray-500 mb-6 block">
            Icerik Istatistikleri
          </span>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-2xl font-bold text-gray-100">{yazilar.length}</p>
              <p className="text-xs text-gray-500 mt-1">Yazi</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{haberler.length}</p>
              <p className="text-xs text-gray-500 mt-1">Haber</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{toplamIcerik}</p>
              <p className="text-xs text-gray-500 mt-1">Toplam Icerik</p>
            </div>
          </div>
        </div>

        {/* ─── Çizgi ─── */}
        <div className="line-void my-12 animate-line-reveal delay-300" />

        {/* ─── Son Yazılar ─── */}
        <div className="animate-fade-up delay-400">
          <span className="text-[11px] font-sans tracking-widest uppercase text-gray-500 mb-6 block">
            Son Yazilar
          </span>
          <div className="space-y-0">
            {sonYazilar.map((yazi, i) => (
              <Link
                key={yazi.slug}
                href={`/yazilar/${yazi.slug}`}
                className="group block py-4 animate-fade-up"
                style={{ animationDelay: `${(i + 5) * 60}ms` }}
              >
                <h3 className="text-sm font-medium text-gray-300 group-hover:text-primary-400 transition-colors">
                  {yazi.title}
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  {yazi.date} · {yazi.category}
                </p>
              </Link>
            ))}
            <Link
              href="/yazilar"
              className="block pt-4 text-xs text-gray-500 hover:text-primary-400 transition-colors"
            >
              Tum yazilari gor
            </Link>
          </div>
        </div>

        {/* ─── Çizgi ─── */}
        <div className="line-void my-10 animate-line-reveal delay-400" />

        {/* ─── Son Haberler ─── */}
        <div className="animate-fade-up delay-500">
          <span className="text-[11px] font-sans tracking-widest uppercase text-gray-500 mb-6 block">
            Son Haberler
          </span>
          <div className="space-y-0">
            {sonHaberler.map((haber, i) => (
              <Link
                key={haber.slug}
                href={`/haberler/${haber.slug}`}
                className="group block py-4 animate-fade-up"
                style={{ animationDelay: `${(i + 5) * 60}ms` }}
              >
                <h3 className="text-sm font-medium text-gray-300 group-hover:text-primary-400 transition-colors">
                  {haber.title}
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  {haber.date} · {haber.sourceName}
                </p>
              </Link>
            ))}
            <Link
              href="/haberler"
              className="block pt-4 text-xs text-gray-500 hover:text-primary-400 transition-colors"
            >
              Tum haberleri gor
            </Link>
          </div>
        </div>

        {/* ─── Son Haftalık Brifing — KALDIRILDI ─── */}

        {/* ─── Çizgi ─── */}
        <div className="line-void my-12 animate-line-reveal delay-500" />

        {/* ─── İletişim ─── */}
        <div className="animate-fade-up delay-500">
          <span className="text-[11px] font-sans tracking-widest uppercase text-gray-500 mb-4 block">
            Iletisim
          </span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href={`mailto:${SITE.author.email}`}
              className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
            >
              {SITE.author.email}
            </a>
            <a
              href={SITE.author.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={SITE.author.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
