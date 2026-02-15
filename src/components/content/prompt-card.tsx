// ─────────────────────────────────────────────────────────────
// AI Rehber — Prompt Card Component
// Monochrome void style
// ─────────────────────────────────────────────────────────────

"use client";

import { cn } from "@/lib/utils";
import { DIFFICULTY } from "@/lib/constants";
import { CopyButton } from "@/components/content/copy-button";

type ModelScore = {
  name: string;
  score: number;
  note?: string;
};

type Variable = {
  name: string;
  description: string;
  example?: string;
};

type PromptCardProps = {
  title: string;
  prompt: string;
  difficulty: "baslangic" | "orta" | "ileri";
  targetRole?: string;
  models?: ModelScore[];
  variables?: Variable[];
  commonMistakes?: string[];
  className?: string;
};

export function PromptCard({
  title,
  prompt,
  difficulty,
  targetRole,
  models = [],
  variables = [],
  commonMistakes = [],
  className,
}: PromptCardProps) {
  const diffLabel = DIFFICULTY[difficulty] ?? difficulty;

  return (
    <div className={cn("my-10", className)}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-200">{title}</h3>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-600">
            {diffLabel}
          </span>
          {targetRole && (
            <span className="text-[10px] text-gray-700">
              {targetRole}
            </span>
          )}
        </div>
      </div>

      {/* Prompt Text */}
      <div className="relative group">
        <pre className="bg-white/[0.02] border border-white/[0.04] text-gray-300 p-5 rounded-lg text-sm font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
          {prompt}
        </pre>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all">
          <CopyButton text={prompt} />
        </div>
      </div>

      {/* Variables */}
      {variables.length > 0 && (
        <div className="mt-6">
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-700 block mb-3">
            Değişkenler
          </span>
          <div className="space-y-2">
            {variables.map((v) => (
              <div key={v.name} className="flex items-baseline gap-3 text-sm">
                <code className="font-mono text-xs text-gray-400">
                  {`{${v.name}}`}
                </code>
                <span className="text-gray-600">{v.description}</span>
                {v.example && (
                  <span className="text-gray-700 text-xs">
                    örn: {v.example}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Scores */}
      {models.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/[0.04]">
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-700 block mb-3">
            Model Skorları
          </span>
          <div className="space-y-2">
            {models
              .sort((a, b) => b.score - a.score)
              .map((m) => (
                <div key={m.name} className="flex items-center gap-3 text-sm">
                  <span className="w-24 text-gray-400 font-medium">{m.name}</span>
                  <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/[0.12] rounded-full"
                      style={{ width: `${m.score * 10}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono text-[10px] text-gray-700">
                    {m.score}/10
                  </span>
                  {m.note && (
                    <span className="text-xs text-gray-600 hidden sm:block max-w-[200px] truncate">
                      {m.note}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Common Mistakes */}
      {commonMistakes.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/[0.04]">
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-700 block mb-3">
            Sık Yapılan Hatalar
          </span>
          <ul className="space-y-1.5">
            {commonMistakes.map((mistake, i) => (
              <li key={i} className="text-sm text-gray-500 flex items-baseline gap-3">
                <span className="text-[11px] font-mono text-gray-700 flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
