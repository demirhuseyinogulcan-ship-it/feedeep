import { useState } from 'react';
import {
  Layers,
  Download,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Database,
} from 'lucide-react';

const statusIcons = {
  pending: <Clock size={14} className="text-gray-400" />,
  running: <Loader2 size={14} className="text-blue-400 animate-spin" />,
  completed: <CheckCircle2 size={14} className="text-emerald-400" />,
  failed: <AlertCircle size={14} className="text-red-400" />,
};

export default function Sidebar({
  queries,
  activeQueryId,
  stats,
  onQueryClick,
  onExportAll,
  onMasterExport,
}) {
  const [showExport, setShowExport] = useState(false);

  return (
    <aside className="w-72 bg-slate-900 text-white flex flex-col h-full border-r border-slate-800 flex-shrink-0">
      {/* ── Marka ─────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
            <Layers size={18} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">
              Web Scraper
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wider">
              FEEDEEP LOCAL
            </p>
          </div>
        </div>
      </div>

      {/* ── İstatistikler ─────────────────────────── */}
      {stats && (
        <div className="px-5 py-4 border-b border-slate-800">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-800/60 rounded-xl p-3">
              <div className="text-xl font-bold text-brand-400">
                {stats.total_companies}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                Firma
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3">
              <div className="text-xl font-bold text-emerald-400">
                {stats.total_with_email}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                E-posta
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3">
              <div className="text-xl font-bold text-slate-300">
                {stats.total_queries}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                Sorgu
              </div>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3">
              <div className="text-xl font-bold text-amber-400">
                {stats.total_duplicates}
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                Tekrar
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sorgu Geçmişi ─────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-3 flex items-center justify-between">
          <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Sorgu Geçmişi
          </h2>
          <span className="text-[11px] text-slate-600">{queries.length}</span>
        </div>

        <div className="px-3 space-y-0.5">
          {queries.map((query) => (
            <button
              key={query.id}
              onClick={() => onQueryClick(query.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                activeQueryId === query.id
                  ? 'bg-brand-600/20 text-brand-300'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusIcons[query.status]}
                <span className="text-sm font-medium truncate flex-1">
                  {query.search_term}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1 ml-[22px]">
                {query.region && (
                  <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                    {query.region}
                  </span>
                )}
                <span className="text-[10px] text-slate-500">
                  {query.new_count || 0} firma
                </span>
                {query.duplicate_count > 0 && (
                  <span className="text-[10px] text-amber-500/70">
                    +{query.duplicate_count} tekrar
                  </span>
                )}
              </div>
            </button>
          ))}

          {queries.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-slate-600">
              Henüz arama yapılmadı
            </p>
          )}
        </div>
      </div>

      {/* ── Toplu Dışa Aktarma ────────────────────── */}
      <div className="px-4 py-4 border-t border-slate-800 space-y-2">
        {/* Master Excel */}
        <button
          onClick={() => onMasterExport && onMasterExport('excel')}
          disabled={!stats || stats.total_companies === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                     bg-brand-600 hover:bg-brand-700 rounded-xl text-sm font-medium
                     transition-colors duration-200
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Database size={14} />
          Master Excel İndir
        </button>

        {/* Tümünü Dışa Aktar */}
        <div className="relative">
          <button
            onClick={() => setShowExport(!showExport)}
            disabled={!stats || stats.total_companies === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5
                       bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-medium
                       transition-colors duration-200
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={14} />
            Sorgu Bazlı Dışa Aktar
          </button>

          {showExport && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl z-10">
              <button
                onClick={() => {
                  onExportAll('csv');
                  setShowExport(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-700 transition-colors"
              >
                📄 CSV olarak indir
              </button>
              <button
                onClick={() => {
                  onExportAll('excel');
                  setShowExport(false);
                }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-700 transition-colors"
              >
                📊 Excel olarak indir
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
