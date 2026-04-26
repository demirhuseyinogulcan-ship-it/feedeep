"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  DatabaseZap,
  Download,
  FileSpreadsheet,
  Loader2,
  MapPin,
  Play,
  RefreshCw,
  Search,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";

const WORKER_URL = "http://127.0.0.1:8000";

type WorkerStatus = "checking" | "online" | "offline";

type QueryItem = {
  id: number;
  search_term: string;
  region: string | null;
  status: "pending" | "running" | "completed" | "failed";
  results_count: number;
  new_count: number;
  duplicate_count: number;
  created_at: string;
};

type Stats = {
  total_companies: number;
  total_with_email: number;
  total_queries: number;
  total_duplicates: number;
};

const quickSearches = [
  "açık kaynak CRM firmaları",
  "yazılım şirketleri İstanbul",
  "ERP danışmanlık firmaları",
  "AI otomasyon ajansları",
  "web tasarım firmaları İzmir",
];

const statusLabels: Record<QueryItem["status"], string> = {
  pending: "Bekliyor",
  running: "Çalışıyor",
  completed: "Tamamlandı",
  failed: "Hata",
};

export function WebScrapingConsole() {
  const [status, setStatus] = useState<WorkerStatus>("checking");
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const [source, setSource] = useState("Google");
  const [maxResults, setMaxResults] = useState(50);
  const [queries, setQueries] = useState<QueryItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const isOnline = status === "online";

  const statusMeta = useMemo(() => {
    if (status === "online") {
      return {
        label: "Local worker bağlı",
        detail: "Kazıma işlemi bu bilgisayarda çalışacak.",
        icon: CheckCircle2,
        iconClassName: "text-emerald-400",
      };
    }

    if (status === "checking") {
      return {
        label: "Local worker kontrol ediliyor",
        detail: "127.0.0.1:8000 bağlantısı deneniyor.",
        icon: Loader2,
        iconClassName: "text-primary-400",
      };
    }

    return {
      label: "Local worker kapalı",
      detail: "Arayüz hazır, kazıma motoru henüz bu cihazda çalışmıyor.",
      icon: AlertCircle,
      iconClassName: "text-amber-400",
    };
  }, [status]);

  const loadWorkerData = useCallback(async () => {
    const [statsRes, queriesRes] = await Promise.all([
      fetch(`${WORKER_URL}/api/stats`, { cache: "no-store" }),
      fetch(`${WORKER_URL}/api/queries?limit=6`, { cache: "no-store" }),
    ]);

    if (statsRes.ok) setStats(await statsRes.json());
    if (queriesRes.ok) setQueries(await queriesRes.json());
  }, []);

  const checkWorker = useCallback(async () => {
    setStatus("checking");
    setNotice(null);

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 1600);

    try {
      const res = await fetch(WORKER_URL, {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("Worker yanıt vermedi");

      setStatus("online");
      await loadWorkerData();
    } catch {
      setStatus("offline");
      setStats(null);
      setQueries([]);
    } finally {
      window.clearTimeout(timer);
    }
  }, [loadWorkerData]);

  useEffect(() => {
    void checkWorker();
  }, [checkWorker]);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim() || !isOnline || isSearching) return;

    setIsSearching(true);
    setNotice(null);

    try {
      const res = await fetch(`${WORKER_URL}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          region: region.trim() || null,
          language: "tr",
          max_results: maxResults,
          search_source: source,
        }),
      });

      if (!res.ok) throw new Error("Arama başlatılamadı");

      setNotice("Arama local worker üzerinde başlatıldı.");
      await loadWorkerData();
      window.setTimeout(() => {
        void loadWorkerData();
      }, 2500);
    } catch {
      setNotice("Arama başlatılamadı. Local worker durumunu kontrol et.");
    } finally {
      setIsSearching(false);
    }
  }

  function openExport(path: string) {
    if (!isOnline) return;
    window.open(`${WORKER_URL}${path}`, "_blank", "noopener,noreferrer");
  }

  const StatusIcon = statusMeta.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 py-1">
        <div className="flex h-9 w-9 items-center justify-center">
          <StatusIcon
            className={cn(
              "h-[18px] w-[18px]",
              statusMeta.iconClassName,
              status === "checking" && "animate-spin",
            )}
          />
        </div>
          <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-100">{statusMeta.label}</p>
          <p className="mt-0.5 text-xs text-gray-600">{statusMeta.detail}</p>
          </div>
          <button
            type="button"
            onClick={checkWorker}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-white/[0.08] bg-surface-1 px-3 text-xs font-medium text-gray-300 transition-colors hover:border-primary-500/30 hover:text-primary-300"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Kontrol Et
          </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="rounded-lg border border-white/[0.06] bg-surface-1/50">
          <div className="border-b border-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary-400" />
              <h2 className="text-sm font-semibold text-gray-100">Firma Arama</h2>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-4 p-4">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-600">
                  Arama
                </span>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    disabled={!isOnline}
                    placeholder="yazılım şirketleri İstanbul"
                    className="h-11 w-full rounded-md border border-white/[0.08] bg-surface-0 pl-10 pr-3 text-sm text-gray-100 outline-none transition-colors placeholder:text-gray-700 focus:border-primary-500/50 disabled:opacity-50"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-600">
                  Bölge
                </span>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />
                  <input
                    value={region}
                    onChange={(event) => setRegion(event.target.value)}
                    disabled={!isOnline}
                    placeholder="Türkiye"
                    className="h-11 w-full rounded-md border border-white/[0.08] bg-surface-0 pl-10 pr-3 text-sm text-gray-100 outline-none transition-colors placeholder:text-gray-700 focus:border-primary-500/50 disabled:opacity-50"
                  />
                </div>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-[160px_160px_minmax(150px,1fr)]">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-600">
                  Kaynak
                </span>
                <select
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  disabled={!isOnline}
                  className="h-10 w-full rounded-md border border-white/[0.08] bg-surface-0 px-3 text-sm text-gray-100 outline-none focus:border-primary-500/50 disabled:opacity-50"
                >
                  <option value="Google">Google</option>
                  <option value="Maps">Google Maps</option>
                  <option value="Her İkisi">Her İkisi</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-widest text-gray-600">
                  Sonuç
                </span>
                <select
                  value={maxResults}
                  onChange={(event) => setMaxResults(Number(event.target.value))}
                  disabled={!isOnline}
                  className="h-10 w-full rounded-md border border-white/[0.08] bg-surface-0 px-3 text-sm text-gray-100 outline-none focus:border-primary-500/50 disabled:opacity-50"
                >
                  {[10, 20, 30, 50, 75, 100].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={!isOnline || !query.trim() || isSearching}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  Aramayı Başlat
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuery(item)}
                  className="rounded-full border border-white/[0.06] px-3 py-1.5 text-xs text-gray-500 transition-colors hover:border-primary-500/30 hover:text-primary-300"
                >
                  {item}
                </button>
              ))}
            </div>

            {notice && (
              <p className="rounded-md border border-white/[0.06] bg-surface-0 px-3 py-2 text-xs text-gray-500">
                {notice}
              </p>
            )}
          </form>
        </section>

        <aside className="space-y-4">
          <section className="rounded-lg border border-white/[0.06] bg-surface-1/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <DatabaseZap className="h-4 w-4 text-primary-400" />
              <h2 className="text-sm font-semibold text-gray-100">Özet</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Firma" value={stats?.total_companies ?? 0} />
              <Metric label="E-posta" value={stats?.total_with_email ?? 0} />
              <Metric label="Sorgu" value={stats?.total_queries ?? 0} />
              <Metric label="Tekrar" value={stats?.total_duplicates ?? 0} />
            </div>
          </section>

          <section className="rounded-lg border border-white/[0.06] bg-surface-1/50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-primary-400" />
              <h2 className="text-sm font-semibold text-gray-100">Dışa Aktar</h2>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => openExport("/api/export-master?format=excel")}
                disabled={!isOnline}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-white/[0.08] bg-surface-0 text-xs font-medium text-gray-300 transition-colors hover:border-primary-500/30 hover:text-primary-300 disabled:opacity-45"
              >
                <Download className="h-3.5 w-3.5" />
                Master Excel
              </button>
              <button
                type="button"
                onClick={() => openExport("/api/export-all?format=csv")}
                disabled={!isOnline}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-white/[0.08] bg-surface-0 text-xs font-medium text-gray-300 transition-colors hover:border-primary-500/30 hover:text-primary-300 disabled:opacity-45"
              >
                <Download className="h-3.5 w-3.5" />
                Tüm CSV
              </button>
            </div>
          </section>
        </aside>
      </div>

      <section className="rounded-lg border border-white/[0.06] bg-surface-1/50">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-primary-400" />
            <h2 className="text-sm font-semibold text-gray-100">Son Aramalar</h2>
          </div>
          <button
            type="button"
            onClick={() => void loadWorkerData()}
            disabled={!isOnline}
            className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-xs text-gray-500 transition-colors hover:text-gray-300 disabled:opacity-45"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Yenile
          </button>
        </div>

        {queries.length > 0 ? (
          <div className="divide-y divide-white/[0.05]">
            {queries.map((item) => (
              <div key={item.id} className="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_120px_90px] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-200">{item.search_term}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    {item.region || "Bölge yok"} · {item.new_count} yeni · {item.duplicate_count} tekrar
                  </p>
                </div>
                <span className={cn(
                  "inline-flex w-fit items-center rounded-full px-2 py-1 text-[11px] font-medium",
                  item.status === "completed" && "bg-emerald-500/10 text-emerald-300",
                  item.status === "running" && "bg-blue-500/10 text-blue-300",
                  item.status === "pending" && "bg-amber-500/10 text-amber-300",
                  item.status === "failed" && "bg-red-500/10 text-red-300",
                )}>
                  {statusLabels[item.status]}
                </span>
                <span className="text-xs tabular-nums text-gray-500 sm:text-right">
                  {item.results_count} sonuç
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-10 text-center">
            <Server className="mx-auto h-8 w-8 text-gray-700" />
            <p className="mt-3 text-sm text-gray-500">
              Local worker bağlanınca son aramalar burada görünecek.
            </p>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-white/[0.06] bg-surface-1/40 p-4">
        <div className="flex items-start gap-3">
          <Server className="mt-0.5 h-4 w-4 text-primary-400" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-gray-100">Local Worker</h2>
            <p className="mt-1 text-xs leading-relaxed text-gray-600">
              Kazıma motoru kullanıcının bilgisayarında çalışır. Feedeep arayüzü sadece bu local servise bağlanır.
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <code className="block overflow-x-auto rounded-md border border-white/[0.06] bg-surface-0 px-3 py-2 text-[11px] text-gray-500">
                cd tools/web-scraper-local/backend
              </code>
              <code className="block overflow-x-auto rounded-md border border-white/[0.06] bg-surface-0 px-3 py-2 text-[11px] text-gray-500">
                python main.py
              </code>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/[0.06] bg-surface-0 px-3 py-2">
      <p className="text-lg font-semibold tabular-nums text-gray-100">{value}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-widest text-gray-700">{label}</p>
    </div>
  );
}
