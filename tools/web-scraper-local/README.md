# feedeep Web Scraper Local

Bu klasör, eski veri kazıma uygulamasının Feedeep için alınmış kaynak kod kopyasıdır. Orijinal `C:\Users\HP\Desktop\veri kazima app` klasörüne dokunulmadı.

Amaç, Feedeep sitesinde kullanıcıyı içeride tutan bir web arayüzü sunmak; ağır kazıma işini ise kullanıcının kendi bilgisayarında çalışan local worker üzerinden yürütmektir. Böylece sunucu maliyeti, IP riski ve uzun çalışan tarayıcı yükü Feedeep altyapısına binmez.

## Kopyaya Dahil Edilenler

- FastAPI backend kaynak kodu
- React + Vite frontend kaynak kodu
- Paket tanımları ve kurulum dosyaları
- Google arama, Google Maps, firma bilgisi çıkarma ve Excel/CSV export kodları

## Kopyaya Dahil Edilmeyenler

- Eski SQLite veritabanı
- Çıktı Excel ve CSV dosyaları
- Browser profil ve cookie dosyaları
- `venv`, `node_modules` ve cache klasörleri
- Eski başlatma kısayolları

## Hedef Mimari

İlk sürümde bu araç ayrı local uygulama gibi çalışır:

1. Kullanıcı Feedeep üzerinde Web Scraping sayfasına girer.
2. Sayfa, kullanıcının bilgisayarında çalışan local API adresine bağlanır.
3. Kazıma kullanıcının bilgisayarındaki Python ve Playwright sürecinde yapılır.
4. Sonuçlar ekranda gösterilir ve Excel/CSV olarak indirilir.

Bu yapı, Feedeep sunucusunun Google aramalarını çalıştırmasını engeller. Site deneyimi Feedeep içinde kalır, yük kullanıcının cihazına dağılır.

## Sonraki Temizlik Adımları

- Arayüzü Feedeep tasarım sistemine yaklaştır
- Tek tık local worker başlatma akışı tasarla
- Local API için güvenli bağlantı kontrolü ekle
- Feedeep sitesindeki `/web-scraping` sayfasını bu worker ile konuştur
- Eski iş odaklı örnekleri genel B2B ve yazılım odaklı aramalara çevir
- Export dosya adlarını Feedeep markasına göre düzenle

## Local Çalıştırma

Backend:

```bash
cd tools/web-scraper-local/backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Frontend:

```bash
cd tools/web-scraper-local/frontend
npm install
npm run dev
```

Varsayılan backend adresi `http://localhost:8000`, frontend adresi ise Vite tarafından verilen lokal adrestir.
