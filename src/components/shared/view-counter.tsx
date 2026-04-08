// feedeep — View Counter
// Gercek sayfa goruntulenme sayisini gosterir.
// count prop disaridan (Supabase veya analitik servisi) beslenmeli.
// count yoksa hicbir sey render edilmez — sahte sayi GOSTERILMEZ.
//
// Gelecek entegrasyon:
//   1. Supabase'de "page_views" tablosu olustur (slug, count)
//   2. /api/views/[slug] route'u ekle (increment + fetch)
//   3. Detay sayfasinda count'u server-side fetch et, bu component'a gecir

interface ViewCounterProps {
  /** Gercek goruntulenme sayisi. Yoksa component render edilmez. */
  count?: number;
}

function formatCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 10 ? `${Math.floor(k)}K` : `${k.toFixed(1)}K`;
  }
  return n.toLocaleString("tr-TR");
}

export function ViewCounter({ count }: ViewCounterProps) {
  if (count === undefined || count === null) return null;

  return (
    <span className="text-[10px] font-sans tracking-wider text-gray-600">
      {formatCount(count)} goruntülenme
    </span>
  );
}
