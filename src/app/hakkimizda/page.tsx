// ─────────────────────────────────────────────────────────────
// AI Rehber — Hakkımızda Sayfası
// Diğer sayfalarla aynı layout, animasyon ve orantı
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { generateMeta, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";

export const metadata: Metadata = generateMeta({
  title: "Hakkımızda — feedeep Ekibi",
  description:
    "feedeep — Yapay zeka dünyasının Türkçe rehberi. Bağımsız, güvenilir, pratik.",
  path: "/hakkimizda",
  keywords: [
    "feedeep hakkında",
    "yapay zeka rehberi",
    "türkçe ai platformu",
    "yapay zeka türkçe",
  ],
});

const DEGERLER = [
  {
    baslik: "Bağımsız Yayıncılık",
    aciklama:
      "Reklam verenlerden ve sponsor baskısından bağımsız içerik üretiyoruz. Değerlendirmelerimiz tamamen editoryal kararlara dayanır.",
  },
  {
    baslik: "Türkçe & Erişilebilir",
    aciklama:
      "Karmaşık AI teknolojilerini herkesin anlayabileceği sade Türkçeyle aktarıyoruz. Teknik bilgi gerektirmez.",
  },
  {
    baslik: "Pratik Odak",
    aciklama:
      "Teorik analizlerin ötesinde, yapay zeka araçlarını iş hayatında nasıl kullanacağınızı gösteren içerikler üretiyoruz.",
  },
  {
    baslik: "Güvenilir Kaynak",
    aciklama:
      "Her içerikte kaynak belirtme, güncellik rozeti ve güven katmanı ile şeffaf bir yayımcılık anlayışı benimsiyoruz.",
  },
] as const;

export default function HakkimizdaPage() {
  return (
    <>
      <JsonLd data={[
        organizationJsonLd(),
        breadcrumbJsonLd([
          { name: "Ana Sayfa", href: "/" },
          { name: "Hakkımızda", href: "/hakkimizda" },
        ]),
      ]} />

      <section className="mx-auto max-w-[640px] px-4 sm:px-0 py-10">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Hakkımızda", href: "/hakkimizda" },
          ]}
        />
        {/* ─── Header — PageHeader bileşeniyle ─── */}
        <PageHeader
          title="Hakkımızda"
          description="Yapay zeka dünyasının Türkçe rehberi. Güvenilir kaynaklarla, pratik uygulamalarla ve Türkiye'nin gerçeklerine uygun içeriklerle yayın yapıyoruz."
        />

        {/* ─── Misyon ─── */}
        <div className="animate-fade-up delay-100">
          <span className="text-[11px] font-sans tracking-widest uppercase text-primary-400/80 mb-4 block">
            Felsefemiz
          </span>
          <p className="text-sm text-gray-400 leading-relaxed max-w-lg">
            Beyaz yakalıların yapay zeka araçlarını iş hayatında etkili
            kullanmasını sağlamak. Karmaşık teknolojileri sade dile çevirmek.
            Türkiye&apos;nin ihtiyaçlarına özel, bağımsız ve kaliteli içerikler üretmek.
          </p>
        </div>

        {/* ─── Çizgi ─── */}
        <div className="line-void my-12 animate-line-reveal" />

        {/* ─── Değerlerimiz ─── */}
        <div className="animate-fade-up delay-200">
          <span className="text-[11px] font-sans tracking-widest uppercase text-gray-500 mb-8 block">
            Değerlerimiz
          </span>

          <div className="space-y-0">
            {DEGERLER.map((deger, i) => (
              <div
                key={deger.baslik}
                className="group py-5 animate-fade-up"
                style={{ animationDelay: `${(i + 3) * 80}ms` }}
              >
                <h3 className="text-lg font-semibold text-gray-200 group-hover:text-gray-100 transition-colors text-glow">
                  {deger.baslik}
                </h3>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed max-w-lg">
                  {deger.aciklama}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Çizgi ─── */}
        <div className="line-void my-12 animate-line-reveal delay-300" />

        {/* ─── Kurucu ─── */}
        <div className="animate-fade-up delay-400">
          <span className="text-[11px] font-sans tracking-widest uppercase text-gray-500 mb-6 block">
            Kurucu
          </span>

          <div className="py-5">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-200 tracking-tight text-glow">
              {SITE.author.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {SITE.author.role}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
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
        </div>

        {/* ─── Çizgi ─── */}
        <div className="line-void my-12 animate-line-reveal delay-400" />

        {/* ─── İletişim ─── */}
        <div className="animate-fade-up delay-500">
          <span className="text-[11px] font-sans tracking-widest uppercase text-gray-500 mb-4 block">
            İletişim
          </span>
          <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
            İş birliği teklifleri, içerik önerileri veya geri bildirimler için{" "}
            <a
              href={`mailto:${SITE.author.email}`}
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              {SITE.author.email}
            </a>{" "}
            adresine yazabilirsiniz.
          </p>
        </div>
      </section>
    </>
  );
}
