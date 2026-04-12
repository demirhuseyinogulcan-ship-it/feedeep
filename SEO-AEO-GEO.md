SEO + AEO + GEO: Tam Rehber
1. Google'ın Gerçekte Nasıl Çalıştığını Anla
Google API Leak (Mayıs 2024 — Yoxa & Fishkin)
Google yıllarca "Biz tıklama verilerini sıralamada kullanmıyoruz" dedi. Sızan 2.500+ sayfalık dahili API dokümantasyonu bunun yalan olduğunu kanıtladı. İşte gerçekten önemli olan modüller:

NavBoost (En kritik sinyal)
Google, Chrome kullanıcılarının tıklama davranışlarını doğrudan sıralama sinyali olarak kullanıyor. Ölçtüğü şeyler:

Tıklama oranı (CTR): Arama sonuçlarında senin linkin göründüğünde kaç kişi tıklıyor
Long click vs short click: Kullanıcı tıklayıp 30+ saniye kalırsa "long click" (iyi). 5 saniyede geri dönerse "short click" / pogo-sticking (kötü)
Last click: Kullanıcı 3 sonuca tıkladı, en son seninkinde kaldı — bu en güçlü sinyal
Bunun pratik anlamı: İçeriğin Google'da 7. sırada bile çıksa, insanlar seninkine tıklayıp kalıyorsa, Google seni yukarı çıkarıyor. Tıklamıyorlarsa veya hemen geri dönüyorlarsa, 1. sıradan bile düşürüyor.

SiteAuthority (Evet, var)
Google "site otoritesi diye bir şey yok" demişti. Leak'te siteAuthority field'ı bulundu. Bu demek ki:

Domain bazında bir otorite skoru var
Yeni siteler (feedeep.com gibi) başlangıçta dezavantajlı
Otorite zamanla, tutarlı kaliteli içerikle ve dış referanslarla artıyor
ChromeViews / ChromeInTotal
Chrome tarayıcısından gelen gerçek trafik verisi sıralamayı etkiliyor. Yani Google sadece arama sonuçlarından değil, doğrudan ziyaretleri de ölçüyor. Sosyal medyadan, Substack'ten, LinkedIn'den gelen trafik burada devreye giriyor.

ClickSignals Modülü


goodClicks, badClicks, lastLongestClicks, 
unicornClicks (aşırı iyi performans gösteren tıklamalar)
Google her sorgu için "bu sonuç kullanıcıyı tatmin etti mi?" hesabı yapıyor.

2. Teknik SEO — Temeli Sağlam At
Bu kısım "herkes biliyor" diyebileceğin şeyler ama çoğu site yanlış yapıyor:

Core Web Vitals (Sayfa Deneyimi)

LCP (Largest Contentful Paint) < 2.5s   → Ana içerik ne kadar hızlı yükleniyor
INP (Interaction to Next Paint) < 200ms  → Tıklamaya ne kadar hızlı tepki veriyor  
CLS (Cumulative Layout Shift) < 0.1      → Sayfa kayması var mı
feedeep Next.js SSG kullandığı için LCP zaten iyi olmalı. Ama şunları kontrol et:

Font yükleme stratejisi (font-display: swap + preload)
Görsel boyutları (width/height attribute'ları eksikse CLS artar)
Üçüncü parti scriptler (analytics, Supabase client-side SDK yükleme zamanı)
Crawl Budget & Indexing
robots.txt — gereksiz sayfaları engelle (admin, API routes, preview)
sitemap.xml — dinamik, her yeni içerikte güncellenen
Internal linking — Google leak'te sourceType: LINKS sinyali var. Site içi linkler sayfa otoritesini dağıtır. Her haberden ilgili haberlere, her yazıdan ilgili yazılara link ver.
Yapısal Veri (Structured Data)

Article JSON-LD        → Her haber/yazı sayfasında
Organization JSON-LD   → Site genelinde
BreadcrumbList JSON-LD → Navigasyon hiyerarşisi
FAQPage JSON-LD        → Soru-cevap içeriklerinde (AEO için kritik)
Author JSON-LD         → E-E-A-T sinyali
3. İçerik Stratejisi — Herkesin Bildiği ve Bilmediği
Herkesin Bildiği
Anahtar kelime araştırması yap, uzun kuyruk hedefle
Kaliteli içerik yaz
Başlık ve meta description optimize et
Herkesin Bilmediği: Information Gain Score
Google'ın patentli ve leak'te doğrulanan bir konsepti: "Bu sayfa, aynı konudaki diğer sayfalara kıyasla yeni bilgi ekliyor mu?"

Yani aynı haberi 50 site yazıyorsa, Google hepsini sıralamaz. Şunu sorar:

Bu içerik özgün bir bakış açısı sunuyor mu?
Başka hiçbir yerde olmayan bir veri, analiz veya görsel var mı?
Yoksa sadece aynı press release'in Türkçe çevirisi mi?
feedeep için pratik uygulama:


KÖTÜ:  "OpenAI GPT-5 çıktı. Şu özellikleri var: ..."  (herkes bunu yazıyor)
İYİ:   "OpenAI GPT-5 çıktı. Biz test ettik, Türkçe performansı şöyle..."
DAHA İYİ: "GPT-5 vs Claude 4 — Türkçe kodlama testinde 47 soru sorduk, sonuçlar..."
Özgün veri, özgün test, özgün analiz = Information Gain = sıralama avantajı.

Topical Authority (Konu Otoritesi)
Google leak'te topicEmbeddings var. Google siteni konusal kümeler halinde değerlendiriyor. feedeep "yapay zeka + yazılım" konusunda yoğunlaşıyor — bu iyi. Ama:


Zayıf topical authority:
  /haberler/openai-gpt5
  /haberler/turkiye-ekonomi    ← Konu dışı, otoriteyi sulandırır
  /haberler/futbol-haberi      ← Felaket

Güçlü topical authority:
  /haberler/openai-gpt5
  /yazilar/openai-modelleri-karsilastirma
  /yazilar/gpt5-turkce-performans-testi
  /haberler/openai-api-fiyatlama-degisiklik
  → Google: "Bu site OpenAI konusunda otorite"
Siloing stratejisi: Konuları kümelere ayır. Her küme için:

1 pillar page (kapsamlı ana yazı)
5-10 cluster page (detay haberler/yazılar)
Hepsi birbirine internal link ile bağlı
Örnek feedeep silolarında:


Silo: "Anthropic/Claude"
  Pillar: /yazilar/claude-rehberi (kapsamlı, sürekli güncellenen)
  Cluster: /haberler/claude-sonnet-4-6...
  Cluster: /haberler/anthropic-30-milyar...
  Cluster: /yazilar/claude-vs-chatgpt...
  (Hepsi birbirine link veriyor)

Silo: "AI Güvenlik"
  Pillar: /yazilar/yapay-zeka-guvenlik-rehberi
  Cluster: /haberler/prompt-injection...
  Cluster: /haberler/ai-sahte-uzanti...
4. AEO — Answer Engine Optimization
Google artık sadece "10 mavi link" değil. Featured Snippets, People Also Ask, AI Overview (SGE) var. Bunlara optimize etmek = AEO.

Featured Snippet Yakalama
Google bir soruya doğrudan cevap verirken sayfanı kullanması için:

1. Soru-cevap formatı kullan:


## ChatGPT Plus ne kadar?

ChatGPT Plus aylık 20 dolar. Ancak Şubat 2026'dan itibaren 
Pro planı aylık 200 dolara yükseldi. Ücretsiz plan hala mevcut 
ancak GPT-4o'ya sınırlı erişim sunuyor.
2. Tanım paragrafı (40-60 kelime):
Google "X nedir?" sorgularında genellikle 40-60 kelimelik tanım paragrafını snippet olarak çeker.

3. Listeleme formatı:


## En İyi 5 Açık Kaynak LLM (2026)

1. **Llama 4** — Meta'nın en güncel modeli, 405B parametre
2. **Qwen 3.5** — Alibaba, Türkçe desteği güçlü
3. **Gemma 4** — Google, Apache 2.0 lisanslı
...
4. Tablo formatı:
Karşılaştırma tabloları featured snippet'te çok güçlü:


| Model | Parametre | Fiyat | Türkçe |
|-------|-----------|-------|--------|
| GPT-5 | ? | $20/ay | İyi |
| Claude 4 | ? | $20/ay | Çok iyi |
People Also Ask (PAA) Optimizasyonu
Google'da bir şey aradığında çıkan "Sıkça Sorulan Sorular" kutusu. Buraya girmek için:

İçeriğinde gerçek soruları H2/H3 olarak kullan
Her soruya 2-3 cümlelik net cevap + detaylı açıklama ver
FAQPage JSON-LD ekle
Araç: Google'da hedef kelimeni yaz, PAA kutusundaki soruları not al, içeriğine entegre et.

5. GEO — Generative Engine Optimization
Bu en yeni ve en kritik alan. ChatGPT, Perplexity, Gemini, Claude gibi AI'lar cevap verirken hangi kaynakları referans gösteriyor?

AI'lar Kaynakları Nasıl Seçiyor?
1. Crawl edilebilirlik:

llms.txt dosyası (feedeep'te zaten var — build'de üretiliyor)
Temiz, semantic HTML (AI bot'lar JavaScript render etmez çoğunlukla)
RSS feed (AI crawl'ları RSS'i seviyor)
2. Atıf olasılığını artıran faktörler:

Araştırmalar (Georgia Tech + Princeton, 2024) şunu gösterdi:

Strateji	Atıf artışı
İstatistik ve veri içermek	+40%
Kaynak göstermek (citation)	+30%
Konuşma dili yerine teknik/akademik dil	+25%
Doğrudan alıntı (quotation)	+20%
Akıcı ve iyi yapılandırılmış metin	+15%
feedeep için pratik uygulama:


KÖTÜ:  "OpenAI çok para topladı"
İYİ:   "OpenAI, Mart 2026'da 30 milyar dolarlık yatırım turunu kapattı. 
        Bu, şirketin değerlemesini 300 milyar dolara çıkardı (kaynak: Reuters)."
AI'lar spesifik veri + kaynak gördüğünde o sayfayı referans olarak kullanma olasılığı çok artıyor.

3. Entity tanınırlığı:
AI modelleri entity'leri (kişi, şirket, ürün) tanır. "feedeep" henüz bir entity değil. Entity olmak için:

Wikipedia'da sayfa (uzun vade)
Wikidata'da kayıt (orta vade, daha kolay)
Schema.org Organization markup (kısa vade — şimdi yapabilirsin)
Birden fazla güvenilir kaynakta tutarlı şekilde anılmak
6. Dağıtım Kanalları — İçeriği Sadece Yayınlama, Dağıt
Burada çoğu kişinin yaptığı hata: "Yazıyı yazdım, siteme koydum, Google sıralasın." Google yeni siteyi hemen sıralamaz. İlk trafiği sen yaratmalısın.

LinkedIn (feedeep için en güçlü kanal)
Neden: Yazılım/AI kitlesi LinkedIn'de çok aktif. Türk tech camiası LinkedIn'i çok kullanıyor.

Strateji:


1. Haberi feedeep'te yayınla
2. LinkedIn'de haberin özet + görüş versiyonunu paylaş
3. Son satırda: "Detaylı analiz feedeep.com'da: [link]"
4. Yorum kısmında ek context ver (algoritma yorumları sever)
Önemli: LinkedIn'de link paylaşırsan erişim düşer (algoritma dış link sevmez). Taktik:

Post'un kendisi değerli olsun (sadece link atma)
Linki ilk yoruma koy VEYA
Carousel/document post yap, son slide'da "feedeep.com'da oku" de
Substack / Newsletter
Newsletter Google sıralamasını doğrudan etkilemez ama:

ChromeViews sinyali: Newsletter'dan siteye tıklayan her kişi Chrome'da direct visit oluşturur → siteAuthority artırır
Sadık kitle: Her yeni içeriğin garantili ilk 100 okuyucusu olur
Sosyal kanıt: "5.000 abonemiz var" → güven sinyali
Substack stratejisi:


Haftalık "AI Haftalık" digest → En önemli 5 haber + kısa yorum
Her haber feedeep.com'a link veriyor
Substack'in kendi keşfet özelliği yeni okuyucu getiriyor
Twitter/X
AI/tech camiası X'te çok aktif. Ama:

Thread formatı iyi çalışıyor
Tek tweet + link çalışmıyor (algoritma cezalandırıyor)
Quote tweet ile tartışma başlatmak > link paylaşmak
GitHub
feedeep zaten GitHub'da. Ama:

llms.txt standardını implement ettiğini bir blog post olarak anlat
Açık kaynak bir araç yap (küçük bile olsa) → GitHub'dan backlink + dev güveni
Mesela: "Türkçe AI Haberleri RSS Feed" gibi bir public repo
Reddit / Hacker News / Ekşi Sözlük
Reddit: r/turkey, r/artificial, r/programming — ama spam yapma, değer kat
Hacker News: Eğer özgün bir teknik yazın varsa "Show HN" ile paylaş
Ekşi Sözlük: Türkçe SEO için hala güçlü backlink kaynağı (entry içinde doğal referans)
7. Growth Hacking — Üst Düzey Taktikler
A. CTR Manipülasyonu (Beyaz Şapka)
Google leak NavBoost'un CTR'ı ölçtüğünü kanıtladı. CTR'ı artırmak için:

Title tag formülleri:


Sayı + Güç kelimesi + Yıl + Konu
"7 Kritik Fark: GPT-5 vs Claude 4 Karşılaştırma (2026)"

Soru formatı:
"Claude 4 mü ChatGPT mi? Türkçe Kodlama Testinde Şaşırtan Sonuç"

Köşeli parantez:
"AI Kodlama Asistanları [2026 Güncel] — Hangisi Gerçekten İşe Yarıyor?"
Meta description'da CTA:


"...5 farklı modeli Türkçe promptlarla test ettik. Sonuçları tabloda gör →"
→ işareti, "tabloda gör", "test sonuçları" gibi ifadeler CTR'ı artırır çünkü kullanıcı tıklayınca ne bulacağını biliyor.

B. Programmatic SEO
Her şirket (OpenAI, Google, Anthropic, Meta...) için otomatik üretilmiş hub sayfaları:


/sirketler/openai    → OpenAI ile ilgili tüm haberler + şirket profili
/sirketler/anthropic → Anthropic haberleri + profil
/konular/prompt-engineering → Tüm prompt engineering içerikleri
Bu sayfalar:

Velite'den otomatik generate edilebilir (zaten tag/kategori sistemi var)
Long-tail arama trafiği çeker ("openai haberleri türkçe")
Internal link hub'ı olarak çalışır (topical authority güçlendirir)
C. Freshness Sinyali
Google leak'te freshnessSignal var. Haber siteleri için özellikle kritik:

Düzenli güncelleme yapılan sayfalar avantajlı
"Son güncelleme: 12 Nisan 2026" göstermek hem kullanıcı hem Google için sinyal
Evergreen yazıları periyodik güncelle (her 2-3 ayda)
D. Parasite SEO / Digital PR (Gelişmiş)
Kendi sitenin otoritesi düşükken, yüksek otoriteli sitelerde yayın yapmak:

Medium Türkçe: feedeep'in en iyi yazılarının kısa versiyonunu Medium'da yayınla, "Tam analiz: feedeep.com" diye link ver
Dev.to: Teknik yazılar için mükemmel, dofollow backlink verir
Kommunity.com: Türk tech topluluğu, etkinlik + yazı paylaşımı
LinkedIn Articles: Google tarafından index'leniyor, yüksek DA
E. HARO / Kaynak Olma (Expert Positioning)
Connectively (eski HARO): Gazeteciler uzman arıyor, AI konusunda kaynak ol → büyük sitelerde mention + backlink
Help a B2B Writer: Aynı konsept, B2B odaklı
Türkçe medyada: Webrazzi, Shiftdelete, Chip gibi sitelere "uzman görüşü" olarak ulaş
F. Surround Sound Stratejisi
Bir konu arandığında Google'ın ilk sayfasındaki her sonuçta senin adının geçmesi:


"En iyi AI haber siteleri" araması:
  1. Sıra: Listicle yazı → feedeep listede
  2. Sıra: Quora cevabı → feedeep önerisi
  3. Sıra: Reddit thread → feedeep linki
  4. Sıra: Medium yazısı → feedeep referansı
Kullanıcı her yerde "feedeep" görünce tıklama olasılığı katlanıyor.

8. Öncelik Sırası — feedeep İçin Aksiyon Planı
En etkisinden en azına, şu sırayla ilerle:

Öncelik	Aksiyon	Etki	Zorluk
1	Teknik SEO tamamla (JSON-LD, sitemap, Core Web Vitals)	Temel	Düşük
2	Information Gain: Her haberde özgün analiz/test/veri ekle	Yüksek	Orta
3	LinkedIn dağıtım rutini oluştur (haftada 3-5 post)	Yüksek	Düşük
4	Haftalık newsletter başlat (Substack)	Orta-Yüksek	Düşük
5	Topical silolar oluştur (şirket hub sayfaları)	Yüksek	Orta
6	GEO: İstatistik + kaynak gösterme standardını her içeriğe uygula	Orta	Düşük
7	FAQPage JSON-LD + soru-cevap formatı	Orta	Düşük
8	Dev.to / Medium cross-posting	Orta	Düşük
9	Programmatic SEO (konu/şirket hub sayfaları)	Yüksek	Orta
10	Digital PR / HARO ile backlink	Yüksek	Yüksek
Özet: Çoğu Kişinin Görmediği Gerçek
Sıralama formülü kabaca şu:


Sıralama = (İçerik Kalitesi × Information Gain) 
         + (Topical Authority × Internal Links)
         + (NavBoost: CTR + Dwell Time + Last Click)
         + (Site Authority × Backlinks)
         + (Freshness × Update Frequency)
         + (User Signals: Chrome data)
Herkes backlink'e takılıyor. Ama Google leak gösterdi ki NavBoost (kullanıcı davranışı) backlink'ten daha ağır basabiliyor. Yani:

İnsanların tıklayıp kaldığı, paylaştığı, tekrar geldiği içerik üret. Bunu sosyal kanallardan dağıt. Google geri kalanını halleder.