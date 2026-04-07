// ─────────────────────────────────────────────────────────────
// feedeep — Global Loading Skeleton
// Suspense boundary — CLS koruması ve UX iyileştirmesi
// ─────────────────────────────────────────────────────────────

export default function Loading() {
  return (
    <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 animate-fade-up">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3 w-16 rounded bg-surface-2 animate-pulse" />
        <div className="h-3 w-3 rounded bg-surface-2" />
        <div className="h-3 w-24 rounded bg-surface-2 animate-pulse" />
      </div>

      {/* Title skeleton */}
      <div className="space-y-3 mb-10">
        <div className="h-8 w-3/4 rounded bg-surface-2 animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-surface-2 animate-pulse delay-100" />
      </div>

      {/* Divider */}
      <div className="line-void mb-10" />

      {/* Content block skeletons */}
      <div className="space-y-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3" style={{ animationDelay: `${(i + 1) * 80}ms` }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-3 w-16 rounded bg-surface-2 animate-pulse" />
              <div className="h-3 w-20 rounded bg-surface-2 animate-pulse" />
            </div>
            <div className="h-5 w-full rounded bg-surface-2 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-surface-2 animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}
