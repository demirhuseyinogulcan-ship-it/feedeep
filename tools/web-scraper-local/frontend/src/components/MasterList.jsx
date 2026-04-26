import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Download,
  Mail,
  Filter,
  Building2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { searchAPI } from '../services/api';
import CompanyCard from './CompanyCard';

export default function MasterList() {
  const [companies, setCompanies] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [onlyWithEmail, setOnlyWithEmail] = useState(false);
  const [page, setPage] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const pageSize = 50;

  const fetchMasterList = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await searchAPI.getMasterList({
        skip: page * pageSize,
        limit: pageSize,
        search: search || undefined,
        only_with_email: onlyWithEmail,
      });
      setCompanies(data.companies);
      setTotal(data.total);
    } catch (err) {
      console.error('Master liste getirilemedi:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, onlyWithEmail]);

  useEffect(() => {
    fetchMasterList();
  }, [fetchMasterList]);

  // Arama debounce
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleExport = async (format) => {
    try {
      const response = await searchAPI.exportMaster(format);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `master_liste.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Master export hatası:', err);
    }
    setShowExport(false);
  };

  const totalPages = Math.ceil(total / pageSize);
  const companiesWithEmail = companies.filter(
    (c) => c.emails && c.emails.length > 0
  );

  return (
    <div className="h-full flex flex-col">
      {/* Üst Bar */}
      <div className="bg-white border-b border-gray-100 px-8 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building2 size={20} className="text-brand-500" />
              Master Firma Listesi
            </h2>
            <div className="flex items-center gap-2">
              <span className="badge-green">
                <Building2 size={10} className="mr-1" />
                {total} benzersiz firma
              </span>
              <span className="badge-blue">
                <Mail size={10} className="mr-1" />
                {companiesWithEmail.length > 0
                  ? `${companiesWithEmail.length}/${companies.length}`
                  : '...'}{' '}
                e-postalı
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Yenile */}
            <button
              onClick={fetchMasterList}
              className="btn-secondary flex items-center gap-1.5"
              title="Listeyi yenile"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Master Export */}
            <div className="relative">
              <button
                onClick={() => setShowExport(!showExport)}
                className="btn-primary flex items-center gap-2"
              >
                <Download size={14} />
                Master Excel İndir
              </button>
              {showExport && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl z-20 overflow-hidden min-w-[200px]">
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                  >
                    📊 Excel (tekrar ayıklanmış)
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                  >
                    📄 CSV (tekrar ayıklanmış)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Arama + Filtreler */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Firma adı, domain veya e-posta ara..."
              className="input-field pl-10 text-sm"
            />
          </div>
          <button
            onClick={() => {
              setOnlyWithEmail(!onlyWithEmail);
              setPage(0);
            }}
            className={`btn-secondary flex items-center gap-2 text-sm ${
              onlyWithEmail
                ? 'bg-brand-50 text-brand-700 ring-2 ring-brand-200'
                : ''
            }`}
          >
            <Mail size={14} />
            Sadece E-postalı
          </button>
        </div>

        {/* Bilgi Notu */}
        <p className="text-[11px] text-gray-400 mt-2">
          💡 Tüm aramalarınızdaki firmalar burada birleştirilir. Aynı domain
          veya e-posta adresine sahip firmalar otomatik olarak tekrar
          ayıklanır. "Master Excel İndir" ile pazarlama için kullanıma hazır
          liste alabilirsiniz.
        </p>
      </div>

      {/* Firma Listesi */}
      <div className="flex-1 overflow-y-auto px-8 pb-6">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw size={24} className="animate-spin text-brand-400" />
            <span className="ml-3 text-gray-400">Yükleniyor...</span>
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400">
            <Building2 size={40} strokeWidth={1} />
            <p className="mt-3 text-sm">
              {search
                ? 'Aramayla eşleşen firma bulunamadı'
                : 'Henüz firma verisi yok. Bir arama yaparak başlayın.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2 pt-3">
              {companies.map((company) => (
                <div key={company.id} className="relative">
                  {/* Hangi arama sorgusuyla bulunduğu */}
                  {company.query_name && (
                    <div className="absolute -top-1 right-2 z-10">
                      <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {company.query_name}
                        {company.query_region
                          ? ` • ${company.query_region}`
                          : ''}
                      </span>
                    </div>
                  )}
                  <CompanyCard company={company} />
                </div>
              ))}
            </div>

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6 py-4">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="btn-secondary flex items-center gap-1 disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                  Önceki
                </button>
                <span className="text-sm text-gray-500">
                  Sayfa {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn-secondary flex items-center gap-1 disabled:opacity-30"
                >
                  Sonraki
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
