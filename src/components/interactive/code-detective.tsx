// ─────────────────────────────────────────────────────────────
// AI Rehber — Code Detective (Hata Bulma Oyunu)
// MDX içinden <CodeDetective /> olarak kullanılır
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

type CodeLine = {
  /** Satır numarası */
  num: number;
  /** Satır içeriği (HTML destekler) */
  content: string;
  /** Bu satır boş mu (tıklanamaz) */
  empty?: boolean;
};

type CodeDetectiveProps = {
  /** Görev başlığı */
  title: string;
  /** Görev açıklaması */
  description: string;
  /** Konsol hata mesajı (opsiyonel) */
  errorMessage?: string;
  /** Dosya adı */
  fileName: string;
  /** Dosya uzantısı rengi */
  fileExt?: string;
  /** Kod satırları */
  lines: CodeLine[];
  /** Doğru satır numarası */
  correctLine: number;
  /** Doğru cevap açıklaması */
  explanation: string;
  /** Düzeltme önerisi */
  fix: string;
  /** İpucu */
  hint?: string;
  /** Maksimum deneme hakkı */
  maxTries?: number;
};

export function CodeDetective({
  title,
  description,
  errorMessage,
  fileName,
  fileExt = "tsx",
  lines,
  correctLine,
  explanation,
  fix,
  hint,
  maxTries = 3,
}: CodeDetectiveProps) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [wrongLines, setWrongLines] = useState<Set<number>>(new Set());

  const handleSelectLine = useCallback(
    (lineNum: number) => {
      if (solved) return;
      const line = lines.find((l) => l.num === lineNum);
      if (line?.empty) return;
      setSelectedLine(lineNum);
    },
    [solved, lines]
  );

  const handleCheck = useCallback(() => {
    if (selectedLine === null || solved) return;

    if (selectedLine === correctLine) {
      setSolved(true);
    } else {
      setTries((t) => t + 1);
      setWrongLines((prev) => new Set([...prev, selectedLine]));
      setSelectedLine(null);

      if (tries + 1 >= maxTries) {
        setSolved(true); // Cevabı göster
      }
    }
  }, [selectedLine, correctLine, solved, tries, maxTries]);

  const handleReset = useCallback(() => {
    setSelectedLine(null);
    setTries(0);
    setSolved(false);
    setShowHint(false);
    setWrongLines(new Set());
  }, []);

  const didFindCorrect = solved && tries < maxTries;

  return (
    <div className="my-8 rounded-2xl border border-white/[0.06] bg-[#0f1117] overflow-hidden not-prose">
      {/* ─── macOS-style header ─── */}
      <div className="flex items-center gap-3 px-5 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#0f1117] border border-white/[0.06] rounded-md text-[11px] text-gray-400">
          <span className="text-blue-400">{fileExt}</span>
          <span>{fileName}</span>
        </div>
      </div>

      {/* ─── Challenge meta ─── */}
      <div className="px-5 pt-5 pb-4">
        <div className="text-[9px] font-bold tracking-[0.18em] uppercase text-blue-400 mb-2 flex items-center gap-2">
          <span className="w-4 h-px bg-blue-400" />
          Hata Tespiti
        </div>
        <h3 className="font-bold text-base text-gray-100 leading-tight mb-1.5 font-[family-name:var(--font-montserrat)]">
          {title}
        </h3>
        <p className="text-[11.5px] text-gray-500 leading-relaxed">
          {description}
        </p>
      </div>

      {/* ─── Error console banner ─── */}
      {errorMessage && (
        <div className="mx-5 mb-4 flex items-start gap-3 p-3 bg-red-500/[0.06] border border-red-500/20 rounded-lg">
          <div className="flex items-center justify-center w-5 h-5 bg-red-500 rounded text-[10px] text-white font-bold shrink-0 mt-0.5">
            ✕
          </div>
          <div className="text-[11px] text-red-400 font-mono leading-relaxed">
            {errorMessage}
          </div>
        </div>
      )}

      {/* ─── Hint ─── */}
      {showHint && hint && (
        <div className="mx-5 mb-4 p-3 bg-yellow-500/[0.06] border border-yellow-500/20 rounded-lg text-[11px] text-yellow-400 leading-relaxed animate-fade-up">
          <strong>İpucu:</strong> {hint}
        </div>
      )}

      {/* ─── Code block ─── */}
      <div className="mx-5 mb-5 border border-white/[0.06] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-black/30 border-b border-white/[0.06]">
          <span className="text-[10px] text-gray-600">{fileName}</span>
          {hint && !showHint && !solved && (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="text-[9px] font-semibold tracking-wider text-yellow-400 bg-yellow-500/10 border border-yellow-500/25 px-2 py-0.5 rounded-full hover:bg-yellow-500/20 transition-colors flex items-center gap-1"
            >
              İpucu
            </button>
          )}
        </div>

        <div>
          {lines.map((line) => {
            const isSelected = selectedLine === line.num;
            const isCorrectLine = solved && line.num === correctLine;
            const isWrongLine = wrongLines.has(line.num);
            const isDimmed = solved && line.num !== correctLine;

            return (
              <div
                key={line.num}
                onClick={() => handleSelectLine(line.num)}
                className={cn(
                  "flex items-stretch min-h-[34px] transition-colors relative",
                  !line.empty && !solved && "cursor-pointer hover:bg-blue-500/[0.04]",
                  line.empty && "cursor-default",
                  isSelected && !solved && "bg-red-500/[0.08]",
                  isCorrectLine && "bg-green-500/[0.08]",
                  isWrongLine && !isCorrectLine && !isSelected && "bg-red-500/[0.04]",
                  isDimmed && "opacity-40"
                )}
              >
                {/* Line number */}
                <div
                  className={cn(
                    "w-11 shrink-0 flex items-center justify-end px-3 text-[12px] font-mono select-none border-r border-white/[0.04] transition-colors",
                    isCorrectLine
                      ? "text-green-500"
                      : isSelected
                        ? "text-gray-500"
                        : "text-gray-800"
                  )}
                >
                  {line.num}
                </div>

                {/* Content */}
                <div
                  className="flex-1 px-4 py-2 font-mono text-[12.5px] leading-relaxed text-gray-300 whitespace-pre flex items-center"
                  dangerouslySetInnerHTML={{ __html: line.content }}
                />

                {/* Badges */}
                {isCorrectLine && (
                  <span className="flex items-center px-3 text-[10px] font-semibold text-green-400 bg-green-500/10 rounded-l animate-fade-up">
                    ✓ Hata Burada
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Feedback ─── */}
      {solved && (
        <div
          className={cn(
            "mx-5 mb-5 p-4 rounded-xl flex gap-3 animate-fade-up",
            didFindCorrect
              ? "bg-green-500/10 border border-green-500/20"
              : "bg-red-500/10 border border-red-500/20"
          )}
        >
          <div
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center text-sm shrink-0",
              didFindCorrect ? "bg-green-500/20" : "bg-red-500/20"
            )}
          >
            {didFindCorrect ? "✓" : "!"}
          </div>
          <div>
            <div
              className={cn(
                "text-[13px] font-bold mb-1",
                didFindCorrect ? "text-green-400" : "text-red-400"
              )}
            >
              {didFindCorrect ? "Hatayı buldun!" : `Cevap: ${correctLine}. satır`}
            </div>
            <div className="text-[11.5px] text-gray-500 leading-relaxed">
              {explanation}
            </div>
            <div className="text-[11.5px] text-yellow-400 mt-2">
              <strong>Düzeltme:</strong> {fix}
            </div>
          </div>
        </div>
      )}

      {/* ─── Bottom bar ─── */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06] bg-black/20">
        {/* Tries */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {Array.from({ length: maxTries }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i < tries ? "bg-red-500" : "bg-white/[0.08]"
                )}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-600">deneme hakkı</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-white/[0.06] text-[11px] font-bold text-gray-600 hover:text-blue-400 hover:border-blue-400 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Sıfırla
          </button>
          {!solved && (
            <button
              type="button"
              onClick={handleCheck}
              disabled={selectedLine === null}
              className={cn(
                "px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all",
                selectedLine !== null
                  ? "bg-blue-500 text-black hover:bg-blue-400"
                  : "bg-gray-800 text-gray-600 cursor-not-allowed"
              )}
            >
              Satırı İşaretle ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
