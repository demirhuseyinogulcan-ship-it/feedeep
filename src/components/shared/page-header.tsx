// ─────────────────────────────────────────────────────────────
// AI Rehber — Page Header (DRY shared component)
// Tüm listing sayfaları için ortak başlık ve alt yazı
// ─────────────────────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-12 animate-fade-up">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-100 tracking-tight">
        {title}
      </h1>
      <p className="mt-3 text-gray-500 text-sm leading-relaxed max-w-lg">
        {description}
      </p>
    </div>
  );
}
