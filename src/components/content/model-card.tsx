// ─────────────────────────────────────────────────────────────
// AI Rehber — Model Card Component
// Monochrome void style
// ─────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils";

type Benchmark = {
  name: string;
  score: number;
  maxScore?: number;
};

type Pricing = {
  free?: boolean;
  input?: string;
  output?: string;
  note?: string;
};

type ModelCardProps = {
  title: string;
  company: string;
  type: "model" | "arac";
  status: "active" | "beta" | "deprecated";
  website?: string;
  pricing?: Pricing;
  contextWindow?: number;
  releaseDate?: string;
  benchmarks?: Benchmark[];
  className?: string;
};

const statusLabel = {
  active: "Aktif",
  beta: "Beta",
  deprecated: "Kullanımdan Kalktı",
};

export function ModelCard({
  title,
  company,
  type,
  status,
  website,
  pricing,
  contextWindow,
  releaseDate,
  benchmarks = [],
  className,
}: ModelCardProps) {
  return (
    <div className={cn("my-10", className)}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-200">{title}</h3>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-600">
            {company} · {type === "model" ? "Model" : "Araç"}
          </span>
          <span className="text-[10px] text-gray-700">
            {statusLabel[status]}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-wrap gap-6 text-sm mb-4">
        {pricing && (
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-gray-700 block mb-1">
              Fiyat
            </span>
            {pricing.free ? (
              <span className="text-gray-400">Ücretsiz</span>
            ) : (
              <span className="text-gray-400">
                {pricing.input && `In: ${pricing.input}`}
                {pricing.output && ` · Out: ${pricing.output}`}
              </span>
            )}
          </div>
        )}
        {contextWindow && (
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-gray-700 block mb-1">
              Context
            </span>
            <span className="text-gray-400">
              {(contextWindow / 1000).toFixed(0)}K token
            </span>
          </div>
        )}
        {releaseDate && (
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-gray-700 block mb-1">
              Çıkış
            </span>
            <span className="text-gray-400">
              {new Date(releaseDate).toLocaleDateString("tr-TR", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono tracking-wider text-gray-700 hover:text-gray-400 transition-colors"
        >
          Web sitesi
        </a>
      )}

      {/* Benchmarks */}
      {benchmarks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/[0.04]">
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-700 block mb-3">
            Benchmarklar
          </span>
          <div className="space-y-2">
            {benchmarks.map((b) => (
              <div key={b.name} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-gray-400">{b.name}</span>
                <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/[0.12] rounded-full"
                    style={{
                      width: `${(b.score / (b.maxScore ?? 100)) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-16 text-right font-mono text-[10px] text-gray-700">
                  {b.score}{b.maxScore && `/${b.maxScore}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
