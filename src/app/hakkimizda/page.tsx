// ─────────────────────────────────────────────────────────────
// feedeep — Hakkımızda Sayfası
// Diğer sayfalarla aynı layout, animasyon ve orantı
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { generateMeta, breadcrumbJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/constants";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd } from "@/lib/seo";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { yazilar, haberler } from "#site/content";

export const metadata: Metadata = generateMeta({
  title: "Hakkımızda — feedeep Editöryal Ekibi",
  description:
    "feedeep — Yazılım ve yapay zeka dünyasından güncel haberler sunan bağımsız Türkçe yayın platformu. Akışın dibindeyiz.",
  path: "/hakkimizda",
  keywords: [
    "feedeep hakkında",
    "feedeep editöryal ekibi",
    "yazılım ve ai haberleri",
    "türkçe teknoloji platformu",
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

const EDITORYAL_SUREC = [
  {
    baslik: "Kaynak Tarama",
    aciklama:
      "RSS beslemeleri ve güvenilir teknoloji kaynaklarından haberleri topluyor, önceliklendiriyoruz. Tier 1 (birincil) kaynaklar önceliklidir.",
  },
  {
    baslik: "Doğrulama",
    aciklama:
      "Her haberin en az bir bağımsız kaynaktan teyit edilmesini sağlıyoruz. Güven seviyesi (yüksek/orta/spekülatif) belirleniyor.",
  },
  {
    baslik: "Türkçe İçerik Üretimi",
    aciklama:
      "Ham haber çevirisi değil, Türkiye okuyucusuna uygun, bağlamlı ve anlaşılır içerik üretiyoruz. Teknik kavramlar sade dille açıklanıyor.",
  },
  {
    baslik: "Kaynak & Güven Katmanı",
    aciklama:
      "Her içerikte kullanılan kaynaklar, tier seviyesiyle birlikte gösterilir. Güncellik rozeti ile içeriğin ne kadar taze olduğu belirtilir.",
  },
  {
    baslik: "Yayın & İzleme",
    aciklama:
      "Yayınlanan içerikler takip edilir. Gelişmeler oluştuğunda güncelleme yapılır, düzeltmeler tarih ve açıklama ile birlikte eklenir.",
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
          description="Yazılım ve yapay zeka dünyasını Türkçe takip ediyoruz. Güvenilir kaynaklarla, pratik uygulamalarla ve Türkiye'nin gerçeklerine uygun içeriklerle yayın yapıyoruz."
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

        {/* ─── Cizgi ─── */}
        <div className="line-void my-12 animate-line-reveal delay-300" />

        {/* ─── Rakamlar ─── */}
        <div className="animate-fade-up delay-300">
          <span className="text-[11px] font-sans tracking-widest uppercase text-gray-500 mb-6 block">
            Rakamlarla feedeep
          </span>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-2xl font-bold text-gray-100">{haberler.filter(h => h.published).length}</p>
              <p className="text-xs text-gray-500 mt-1">Haber</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{yazilar.filter(y => y.published).length}</p>
              <p className="text-xs text-gray-500 mt-1">Analiz & İnceleme</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">
                {new Set([
                  ...haberler.flatMap(h => h.sources?.map(s => s.url) ?? []),
                  ...yazilar.flatMap(y => y.sources?.map(s => s.url) ?? []),
                ]).size}
              </p>
              <p className="text-xs text-gray-500 mt-1">Benzersiz Kaynak</p>
            </div>
          </div>
        </div>

        {/* ─── Cizgi ─── */}
        <div className="line-void my-12 animate-line-reveal delay-300" />

        {/* ─── Editoryal Ekip ─── */}
        <div className="animate-fade-up delay-400">
          <span className="text-[11px] font-sans tracking-widest uppercase text-gray-500 mb-6 block">
            Editöryal Ekip
          </span>
          <div className="space-y-3 text-sm text-gray-400 leading-relaxed max-w-lg">
            <p>
              feedeep içeriklerinin tamamı, {SITE.author.name} tarafından
              üretilmekte ve yayınlanmaktadır. Editöryal kararlar, kaynak
              seçimi ve içerik önceliklendirmesi ekip tarafından bağımsız
              olarak belirlenir.
            </p>
            <p>
              Ekibimiz yapay zeka, yazılım geliştirme, siber güvenlik ve
              dijital strateji alanlarında uzmanlaşmıştır. Her içerik,
              aşağıda detayları verilen editöryal süreçten geçerek
              okuyucuya ulaşır.
            </p>
          </div>
        </div>

        {/* ─── Cizgi ─── */}
        <div className="line-void my-12 animate-line-reveal delay-400" />

        {/* ─── Editoryal Surec ─── */}
        <div className="animate-fade-up delay-400">
          <span className="text-[11px] font-sans tracking-widest uppercase text-primary-400/80 mb-6 block">
            Editöryal Sürecimiz
          </span>
          <div className="space-y-0">
            {EDITORYAL_SUREC.map((adim, i) => (
              <div
                key={adim.baslik}
                className="group py-5 animate-fade-up"
                style={{ animationDelay: `${(i + 5) * 80}ms` }}
              >
                <div className="flex items-baseline gap-3">
                  <span className="text-xs font-mono text-primary-400/60">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="text-lg font-semibold text-gray-200 group-hover:text-gray-100 transition-colors text-glow">
                    {adim.baslik}
                  </h3>
                </div>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed max-w-lg pl-8">
                  {adim.aciklama}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Cizgi ─── */}
        <div className="line-void my-12 animate-line-reveal delay-500" />

        {/* ─── Duzeltme Politikasi ─── */}
        <div className="animate-fade-up delay-500">
          <span className="text-[11px] font-sans tracking-widest uppercase text-gray-500 mb-6 block">
            Düzeltme & Güncelleme Politikası
          </span>
          <div className="space-y-3 text-sm text-gray-400 leading-relaxed max-w-lg">
            <p>
              Hata yapmamak için titizlikle çalışıyoruz, ancak hata yaptığımızda
              bunu şeffaf bir şekilde düzeltiyoruz. Tüm içeriklerimizde güncellik
              rozeti ve kaynak göstergesi bulunur.
            </p>
            <p>
              Bir içerikle ilgili hata bildirimi için{" "}
              <a
                href={`mailto:${SITE.author.email}`}
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                {SITE.author.email}
              </a>{" "}
              adresine yazabilirsiniz. Düzeltmeler, ilgili içeriğin altında tarih
              ve açıklama ile birlikte yayınlanır.
            </p>
          </div>
        </div>

        {/* ─── Cizgi ─── */}
        <div className="line-void my-12 animate-line-reveal delay-500" />

        {/* ─── Iletisim ─── */}
        <div className="animate-fade-up delay-500">
          <span className="text-[11px] font-sans tracking-widest uppercase text-gray-500 mb-4 block">
            İletişim
          </span>
          <p className="text-sm text-gray-500 leading-relaxed max-w-lg mb-4">
            İş birliği teklifleri, içerik önerileri veya geri bildirimler için{" "}
            <a
              href={`mailto:${SITE.author.email}`}
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              {SITE.author.email}
            </a>{" "}
            adresine yazabilirsiniz.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a
              href={SITE.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={SITE.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
            >
              Instagram
            </a>
            <a
              href={SITE.social.x}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
            >
              X
            </a>
            <a
              href={SITE.social.substack}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-primary-400 transition-colors"
            >
              Substack
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
