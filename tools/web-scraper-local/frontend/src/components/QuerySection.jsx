import { useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
  Download,
  Trash2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Building2,
  Mail,
} from 'lucide-react';
import CompanyCard from './CompanyCard';

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Bekliyor',
    color: 'text-gray-400',
  },
  running: {
    icon: Loader2,
    label: 'Aranıyor...',
    color: 'text-blue-500',
    spin: true,
  },
  completed: {
    icon: CheckCircle2,
    label: 'Tamamlandı',
    color: 'text-emerald-500',
  },
  failed: {
    icon: AlertCircle,
    label: 'Hata',
    color: 'text-red-500',
  },
};

export default function QuerySection({
  query,
  companies,
  onExport,
  onDelete,
  onCancel,
}) {
  const [expanded, setExpanded] = useState(true);
  const [showExport, setShowExport] = useState(false);

  const status = statusConfig[query.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  const newCompanies = companies.filter((c) => !c.is_duplicate);
  const companiesWithEmail = newCompanies.filter(
    (c) => c.emails && c.emails.length > 0
  );

  return (
    <div id={`query-${query.id}`} className="fade-in">
      {/* ── Sorgu Başlığı ──────────────────────────── */}
      <div className="card p-4 mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Genişlet/Daralt */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {expanded ? (
                <ChevronUp size={16} className="text-gray-400" />
              ) : (
                <ChevronDown size={16} className="text-gray-400" />
              )}
            </button>

            {/* Sorgu Bilgisi */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {query.search_term}
                </h3>
                {query.region && (
                  <span className="badge-blue text-[10px]">
                    {query.region}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`inline-flex items-center gap-1 text-xs ${status.color}`}
                >
                  <StatusIcon
                    size={12}
                    className={status.spin ? 'animate-spin' : ''}
                  />
                  {status.label}
                </span>
                <span className="text-[11px] text-gray-400">
                  {new Date(query.created_at).toLocaleString('tr-TR')}
                </span>
              </div>
            </div>
          </div>

          {/* Sağ: İstatistik Badge'leri + Aksiyonlar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="badge-green">
                <Building2 size={10} className="mr-1" />
                {query.new_count || newCompanies.length} firma
              </span>
              <span className="badge-blue">
                <Mail size={10} className="mr-1" />
                {companiesWithEmail.length} e-posta
              </span>
              {query.duplicate_count > 0 && (
                <span className="badge-yellow">
                  {query.duplicate_count} tekrar
                </span>
              )}
              {query.filtered_count > 0 && (
                <span className="badge-gray">
                  {query.filtered_count} filtrelendi
                </span>
              )}
            </div>

            {/* Aksiyonlar */}
            <div className="flex items-center gap-1">
              {/* Dışa Aktar */}
              <div className="relative">
                <button
                  onClick={() => setShowExport(!showExport)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                  title="Dışa aktar"
                >
                  <Download size={14} />
                </button>
                {showExport && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl z-20 overflow-hidden min-w-[170px]">
                    <button
                      onClick={() => {
                        onExport('csv');
                        setShowExport(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                    >
                      📄 CSV olarak indir
                    </button>
                    <button
                      onClick={() => {
                        onExport('excel');
                        setShowExport(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                    >
                      📊 Excel olarak indir
                    </button>
                  </div>
                )}
              </div>

              {/* İptal Et (sadece running/pending) */}
              {(query.status === 'running' || query.status === 'pending') && (
                <button
                  onClick={onCancel}
                  className="p-2 hover:bg-orange-50 rounded-lg transition-colors text-orange-400 hover:text-orange-600"
                  title="Aramayı iptal et"
                >
                  <XCircle size={14} />
                </button>
              )}

              {/* Sil */}
              <button
                onClick={onDelete}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                title="Sorguyu sil"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Hata Mesajı */}
        {query.error_message && (
          <div className="mt-3 p-3 bg-red-50 rounded-xl text-sm text-red-600 border border-red-100">
            {query.error_message}
          </div>
        )}
      </div>

      {/* ── Firmalar ───────────────────────────────── */}
      {expanded && (
        <div className="space-y-1.5 ml-4">
          {/* Yükleniyor */}
          {(query.status === 'running' || query.status === 'pending') &&
            companies.length === 0 && (
              <div className="flex items-center gap-3 p-8 text-gray-400">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">
                  Firmalar taranıyor, lütfen bekleyin...
                </span>
              </div>
            )}

          {/* Firma Kartları */}
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}

          {/* Sonuç Yok */}
          {query.status === 'completed' && companies.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-400">
              Bu sorgu için sonuç bulunamadı
            </div>
          )}
        </div>
      )}
    </div>
  );
}
