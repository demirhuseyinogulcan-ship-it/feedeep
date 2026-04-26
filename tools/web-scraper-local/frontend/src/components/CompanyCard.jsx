import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Globe,
  Copy,
  Check,
  AlertTriangle,
  ChevronRight,
  Map,
  User,
} from 'lucide-react';

export default function CompanyCard({ company }) {
  const [copied, setCopied] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const hasContact =
    (company.emails && company.emails.length > 0) ||
    (company.phones && company.phones.length > 0);

  return (
    <div
      className={`card p-4 fade-in ${
        company.is_duplicate ? 'opacity-40 border-dashed border-amber-200' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* ── Firma Adı & Domain ──────────────── */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-0.5 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            >
              <ChevronRight
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${
                  expanded ? 'rotate-90' : ''
                }`}
              />
            </button>

            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {company.name || company.domain || 'Bilinmiyor'}
            </h4>

            {company.is_duplicate && (
              <span className="badge-yellow text-[10px] flex-shrink-0">
                <AlertTriangle size={10} className="mr-0.5" />
                Tekrar
              </span>
            )}

            {company.search_source === 'Google Maps' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex-shrink-0 flex items-center gap-0.5">
                <Map size={9} />
                Maps
              </span>
            )}

            {!company.is_duplicate && company.confidence_score >= 0.7 && (
              <span className="badge-green text-[10px] flex-shrink-0">
                Yüksek Güven
              </span>
            )}

            {!company.is_duplicate &&
              company.confidence_score >= 0.4 &&
              company.confidence_score < 0.7 && (
                <span className="badge-blue text-[10px] flex-shrink-0">
                  Orta
                </span>
              )}
          </div>

          {/* ── Website Link ───────────────────── */}
          {company.domain && (
            <div className="flex items-center gap-2 mt-1 ml-[22px]">
              <Globe size={12} className="text-gray-400 flex-shrink-0" />
              <a
                href={company.website || `https://${company.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-600 hover:text-brand-700 hover:underline truncate"
              >
                {company.domain}
              </a>
              <ExternalLink
                size={10}
                className="text-gray-300 flex-shrink-0"
              />
            </div>
          )}

          {/* ── İletişim Bilgileri ──────────────── */}
          <div className="flex items-center gap-3 mt-2 ml-[22px] flex-wrap">
            {/* E-postalar */}
            {company.emails &&
              company.emails.map((email, i) => (
                <button
                  key={i}
                  onClick={() => copyToClipboard(email, `email-${i}`)}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-600
                             hover:text-brand-600 bg-gray-50 hover:bg-brand-50
                             px-2.5 py-1 rounded-lg transition-colors group"
                  title="Kopyalamak için tıklayın"
                >
                  <Mail size={11} className="text-brand-400 flex-shrink-0" />
                  <span className="truncate max-w-[200px]">{email}</span>
                  {copied === `email-${i}` ? (
                    <Check size={10} className="text-emerald-500" />
                  ) : (
                    <Copy
                      size={10}
                      className="text-gray-300 group-hover:text-brand-400"
                    />
                  )}
                </button>
              ))}

            {/* Telefonlar */}
            {company.phones &&
              company.phones.map((phone, i) => (
                <button
                  key={i}
                  onClick={() => copyToClipboard(phone, `phone-${i}`)}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-500
                             bg-gray-50 hover:bg-emerald-50 hover:text-emerald-700
                             px-2.5 py-1 rounded-lg transition-colors group"
                  title="Kopyalamak için tıklayın"
                >
                  <Phone
                    size={11}
                    className="text-emerald-400 flex-shrink-0"
                  />
                  {phone}
                  {copied === `phone-${i}` ? (
                    <Check size={10} className="text-emerald-500" />
                  ) : (
                    <Copy
                      size={10}
                      className="text-gray-300 group-hover:text-emerald-400"
                    />
                  )}
                </button>
              ))}

            {/* İletişim bilgisi bulunamadı */}
            {!hasContact && !company.is_duplicate && company.scraped && (
              <span className="text-[11px] text-gray-400 italic">
                İletişim bilgisi bulunamadı
              </span>
            )}

            {/* Kazıma hatası */}
            {company.scrape_error && (
              <span className="text-[11px] text-red-400 italic">
                Kazıma hatası
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Detaylar (genişletilmiş) ───────────── */}
      {expanded && (
        <div className="mt-3 ml-[22px] pt-3 border-t border-gray-50 space-y-2 fade-in">
          {/* Açıklama */}
          {company.description && (
            <p className="text-xs text-gray-500 leading-relaxed">
              {company.description}
            </p>
          )}

          {/* Adres */}
          {company.address && (
            <div className="flex items-start gap-1.5 text-xs text-gray-500">
              <MapPin size={12} className="mt-0.5 flex-shrink-0" />
              <span>{company.address}</span>
            </div>
          )}

          {/* Google snippet (açıklama yoksa) */}
          {company.google_snippet && !company.description && (
            <p className="text-xs text-gray-400 italic leading-relaxed">
              {company.google_snippet}
            </p>
          )}

          {/* Google başlık */}
          {company.google_title && (
            <p className="text-[11px] text-gray-400">
              <span className="font-medium">Google:</span>{' '}
              {company.google_title}
            </p>
          )}

          {/* İlgili kişi */}
          {company.contact_person && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <User size={12} className="flex-shrink-0 text-purple-400" />
              <span className="font-medium">{company.contact_person}</span>
              {company.contact_title && (
                <span className="text-gray-400">— {company.contact_title}</span>
              )}
            </div>
          )}

          {/* Email varyantları */}
          {company.email_variants && Object.keys(company.email_variants).length > 0 && (
            <div className="mt-1">
              <p className="text-[10px] text-gray-400 font-medium mb-1">Olası e-postalar:</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(company.email_variants).map(([key, email]) => (
                  <button
                    key={key}
                    onClick={() => copyToClipboard(email, `variant-${key}`)}
                    className="inline-flex items-center gap-1 text-[10px] text-gray-500
                               bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md
                               transition-colors group"
                    title={`Kopyala: ${email}`}
                  >
                    <Mail size={9} className="text-purple-400" />
                    {email}
                    {copied === `variant-${key}` ? (
                      <Check size={8} className="text-emerald-500" />
                    ) : (
                      <Copy size={8} className="text-gray-300 group-hover:text-purple-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Arama kaynağı */}
          {company.search_source && (
            <p className="text-[10px] text-gray-400 mt-1">
              <span className="font-medium">Kaynak:</span> {company.search_source}
            </p>
          )}

          {/* Kaynak URL */}
          {company.source_url && (
            <a
              href={company.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-brand-500 mt-1"
            >
              Kaynak:{' '}
              {company.source_url.length > 70
                ? company.source_url.substring(0, 70) + '...'
                : company.source_url}
              <ExternalLink size={9} />
            </a>
          )}

          {/* Tüm e-postaları kopyala butonu */}
          {company.emails && company.emails.length > 1 && (
            <button
              onClick={() =>
                copyToClipboard(company.emails.join(', '), 'all-emails')
              }
              className="inline-flex items-center gap-1.5 text-[11px] text-brand-600
                         hover:text-brand-700 font-medium mt-1"
            >
              {copied === 'all-emails' ? (
                <>
                  <Check size={11} className="text-emerald-500" />
                  Kopyalandı!
                </>
              ) : (
                <>
                  <Copy size={11} />
                  Tüm e-postaları kopyala
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
