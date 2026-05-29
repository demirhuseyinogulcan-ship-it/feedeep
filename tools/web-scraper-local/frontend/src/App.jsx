import { useState, useEffect, useCallback, useRef } from 'react';
import { searchAPI } from './services/api';
import Sidebar from './components/Sidebar';
import SearchPanel from './components/SearchPanel';
import QuerySection from './components/QuerySection';
import MasterList from './components/MasterList';
import { Search, List, Database } from 'lucide-react';

function App() {
  const [queries, setQueries] = useState([]);
  const [queryCompanies, setQueryCompanies] = useState({});
  const [stats, setStats] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [activeQueryId, setActiveQueryId] = useState(null);
  const [activeTab, setActiveTab] = useState('searches'); // 'searches' | 'master'
  const pollRef = useRef(null);

  // ── Veri Getirme Fonksiyonları ────────────────────────

  const fetchQueries = useCallback(async () => {
    try {
      const { data } = await searchAPI.getQueries();
      setQueries(data);
      return data;
    } catch (err) {
      console.error('Sorgular getirilemedi:', err);
      return [];
    }
  }, []);

  const fetchCompanies = useCallback(
    async (queryId) => {
      try {
        const { data } = await searchAPI.getQueryCompanies(
          queryId,
          showDuplicates
        );
        setQueryCompanies((prev) => ({ ...prev, [queryId]: data }));
      } catch (err) {
        console.error(`Firmalar getirilemedi (sorgu #${queryId}):`, err);
      }
    },
    [showDuplicates]
  );

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await searchAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error('İstatistikler getirilemedi:', err);
    }
  }, []);

  // ── İlk Yükleme ──────────────────────────────────────

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQueries().then((qs) => {
      qs.forEach((q) => fetchCompanies(q.id));

      // Takılı (running/pending) sorguları tekrar polling'e al
      const activeQueries = qs.filter(
        (q) => q.status === 'running' || q.status === 'pending'
      );
      activeQueries.forEach((aq) => {
        setIsSearching(true);
        const pollId = setInterval(async () => {
          try {
            const { data: queryStatus } = await searchAPI.getQuery(aq.id);
            setQueries((prev) =>
              prev.map((q) => (q.id === aq.id ? queryStatus : q))
            );
            await fetchCompanies(aq.id);
            if (
              queryStatus.status === 'completed' ||
              queryStatus.status === 'failed'
            ) {
              clearInterval(pollId);
              fetchStats();
              setIsSearching(false);
            }
          } catch (err) {
            console.error('Polling hatası:', err);
          }
        }, 3000);
      });
    });
    fetchStats();
  }, []);

  // ── Tekrar göster/gizle değiştiğinde yeniden getir ───

  useEffect(() => {
    queries.forEach((q) => fetchCompanies(q.id));
  }, [showDuplicates]);

  // ── Yeni Arama Başlat ────────────────────────────────

  const handleSearch = async (searchData) => {
    setIsSearching(true);
    try {
      const { data: newQuery } = await searchAPI.startSearch(searchData);
      setQueries((prev) => [newQuery, ...prev]);
      setActiveQueryId(newQuery.id);

      // Polling: her 3 saniyede durumu kontrol et
      const pollId = setInterval(async () => {
        try {
          const { data: queryStatus } = await searchAPI.getQuery(newQuery.id);
          setQueries((prev) =>
            prev.map((q) => (q.id === newQuery.id ? queryStatus : q))
          );

          await fetchCompanies(newQuery.id);

          if (
            queryStatus.status === 'completed' ||
            queryStatus.status === 'failed'
          ) {
            clearInterval(pollId);
            fetchStats();
            setIsSearching(false);
          }
        } catch (err) {
          console.error('Polling hatası:', err);
        }
      }, 3000);

      pollRef.current = pollId;
    } catch (err) {
      console.error('Arama başarısız:', err);
      setIsSearching(false);
    }
  };

  // ── Dışa Aktarma ─────────────────────────────────────

  const handleExport = async (queryId, format) => {
    try {
      const response = queryId
        ? await searchAPI.exportQuery(queryId, format)
        : await searchAPI.exportAll(format);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `firmalar_${queryId || 'tumu'}.${
        format === 'excel' ? 'xlsx' : 'csv'
      }`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Dışa aktarma başarısız:', err);
    }
  };

  // ── Master Excel Export ───────────────────────────────

  const handleMasterExport = async (format) => {
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
      console.error('Master export başarısız:', err);
    }
  };

  // ── Sorgu Sil ─────────────────────────────────────────

  const handleDelete = async (queryId) => {
    if (!window.confirm('Bu sorgu ve tüm sonuçları silinecek. Emin misiniz?')) {
      return;
    }
    try {
      await searchAPI.deleteQuery(queryId);
      setQueries((prev) => prev.filter((q) => q.id !== queryId));
      setQueryCompanies((prev) => {
        const next = { ...prev };
        delete next[queryId];
        return next;
      });
      fetchStats();
    } catch (err) {
      console.error('Silme başarısız:', err);
    }
  };

  // ── Sorgu İptal ───────────────────────────────────────

  const handleCancel = async (queryId) => {
    try {
      await searchAPI.cancelQuery(queryId);
      setQueries((prev) =>
        prev.map((q) =>
          q.id === queryId
            ? { ...q, status: 'failed', error_message: 'Kullanıcı tarafından iptal edildi' }
            : q
        )
      );
      setIsSearching(false);
      fetchStats();
    } catch (err) {
      console.error('İptal başarısız:', err);
    }
  };

  // ── Sorguya Scroll ────────────────────────────────────

  const scrollToQuery = (queryId) => {
    setActiveQueryId(queryId);
    const element = document.getElementById(`query-${queryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // ── Temizlik ──────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ── Render ────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sol Panel - Sorgu Geçmişi */}
      <Sidebar
        queries={queries}
        activeQueryId={activeQueryId}
        stats={stats}
        onQueryClick={(queryId) => {
          setActiveTab('searches');
          scrollToQuery(queryId);
        }}
        onDelete={handleDelete}
        onExportAll={(format) => handleExport(null, format)}
        onMasterExport={handleMasterExport}
      />

      {/* Ana İçerik */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Sekme Navigasyonu */}
        <div className="bg-white border-b border-gray-200 px-8 flex items-center gap-0 flex-shrink-0">
          <button
            onClick={() => setActiveTab('searches')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'searches'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Search size={15} />
            Aramalar
          </button>
          <button
            onClick={() => setActiveTab('master')}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'master'
                ? 'border-brand-500 text-brand-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Database size={15} />
            Tüm Firmalar
            {stats && stats.total_companies > 0 && (
              <span className="text-[10px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded-full">
                {stats.total_companies}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'searches' ? (
          <>
            {/* Arama Paneli */}
            <SearchPanel
              onSearch={handleSearch}
              isSearching={isSearching}
              showDuplicates={showDuplicates}
              onToggleDuplicates={() => setShowDuplicates(!showDuplicates)}
            />

            {/* Sonuçlar - Dikey yığılmış sorgular */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              {queries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Search size={32} strokeWidth={1.5} />
                  </div>
                  <p className="text-lg font-medium text-gray-500">
                    Aramaya Başlayın
                  </p>
                  <p className="mt-1 text-sm max-w-md text-center">
                    Firma ve şirket bilgilerini keşfetmek için yukarıdan arama
                    yapın. Sonuçlar burada sıralanacak.
                  </p>
                </div>
              ) : (
                <div className="space-y-6 pt-2">
                  {queries.map((query) => (
                    <QuerySection
                      key={query.id}
                      query={query}
                      companies={queryCompanies[query.id] || []}
                      onExport={(format) => handleExport(query.id, format)}
                      onDelete={() => handleDelete(query.id)}
                      onCancel={() => handleCancel(query.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <MasterList />
        )}
      </main>
    </div>
  );
}

export default App;
