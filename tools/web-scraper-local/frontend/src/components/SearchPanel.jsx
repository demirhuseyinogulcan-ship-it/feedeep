import { useState } from 'react';
import {
  Search,
  MapPin,
  Globe,
  Filter,
  Eye,
  EyeOff,
  Loader2,
  Map,
} from 'lucide-react';

export default function SearchPanel({
  onSearch,
  isSearching,
  showDuplicates,
  onToggleDuplicates,
}) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState('');
  const [language, setLanguage] = useState('tr');
  const [maxResults, setMaxResults] = useState(50);
  const [searchSource, setSearchSource] = useState('Google');
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    onSearch({
      query: query.trim(),
      region: region.trim() || null,
      language,
      max_results: maxResults,
      search_source: searchSource,
    });
  };

  // Genel B2B ve yazılım araştırmaları için hızlı arama önerileri
  const presets = [
    'açık kaynak CRM firmaları',
    'SaaS ajansları İstanbul',
    'yazılım şirketleri Ankara',
    'e-ticaret altyapı firmaları',
    'B2B lead generation şirketleri',
    'ERP danışmanlık firmaları',
    'AI otomasyon ajansları',
    'web tasarım firmaları İzmir',
  ];

  return (
    <div className="bg-white border-b border-gray-100 px-8 py-5 flex-shrink-0">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          {/* Ana Arama Kutusu */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Firma, sektör veya ürün ara... (ör: yazılım şirketleri İstanbul)"
              className="input-field pl-11"
              disabled={isSearching}
            />
          </div>

          {/* Bölge */}
          <div className="w-48 relative">
            <MapPin
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Bölge (opsiyonel)"
              className="input-field pl-10 text-sm"
              disabled={isSearching}
            />
          </div>

          {/* Filtre Butonu */}
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${
              showFilters ? 'bg-gray-200 ring-2 ring-gray-300' : ''
            }`}
          >
            <Filter size={14} />
            Filtre
          </button>

          {/* Tekrar Göster/Gizle */}
          <button
            type="button"
            onClick={onToggleDuplicates}
            className={`btn-secondary flex items-center gap-2 ${
              showDuplicates
                ? 'bg-amber-50 text-amber-700 ring-2 ring-amber-200'
                : ''
            }`}
            title={showDuplicates ? 'Tekrarları gizle' : 'Tekrarları göster'}
          >
            {showDuplicates ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>

          {/* Arama Butonu */}
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="btn-primary flex items-center gap-2 min-w-[130px] justify-center"
          >
            {isSearching ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Aranıyor...
              </>
            ) : (
              <>
                <Search size={16} />
                Ara
              </>
            )}
          </button>
        </div>

        {/* Filtre Paneli */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl fade-in">
            <div className="flex items-center gap-6">
              {/* Kaynak Seçimi */}
              <div className="flex items-center gap-2">
                <Map size={14} className="text-gray-400" />
                <label className="text-xs text-gray-500 font-medium">
                  Kaynak:
                </label>
                <select
                  value={searchSource}
                  onChange={(e) => setSearchSource(e.target.value)}
                  className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5
                             focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="Google">Google Arama</option>
                  <option value="Maps">Google Maps</option>
                  <option value="Her İkisi">Her İkisi</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Globe size={14} className="text-gray-400" />
                <label className="text-xs text-gray-500 font-medium">
                  Dil:
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5
                             focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                  <option value="ar">العربية</option>
                  <option value="ru">Русский</option>
                  <option value="it">Italiano</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 font-medium">
                  Maks. Sonuç:
                </label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value))}
                  className="text-sm bg-white border border-gray-200 rounded-lg px-3 py-1.5
                             focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="30">30</option>
                  <option value="50">50</option>
                  <option value="75">75</option>
                  <option value="100">100</option>
                  <option value="150">150</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Hızlı Arama Etiketleri */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-[11px] text-gray-400 font-medium mr-1">
          Hızlı:
        </span>
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => setQuery(preset)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-500
                       hover:bg-brand-50 hover:text-brand-600 transition-colors duration-200"
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
