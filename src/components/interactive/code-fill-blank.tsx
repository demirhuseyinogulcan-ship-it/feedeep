// ─────────────────────────────────────────────────────────────
// AI Rehber — Code Fill-in-the-Blank (Boşluk Doldurma)
// MDX içinden <CodeFillBlank /> olarak kullanılır
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";

type BlankOption = {
  text: string;
  correct?: boolean;
};

type CodeFillBlankProps = {
  /** Soru / görev açıklaması */
  question: string;
  /** Kodun blank öncesi kısmı */
  codeBefore: string;
  /** Kodun blank sonrası kısmı */
  codeAfter: string;
  /** Seçenekler */
  options: BlankOption[];
  /** Doğru cevap açıklaması */
  explanation?: string;
  /** Görev numarası */
  taskNumber?: number;
  /** Toplam görev sayısı */
  totalTasks?: number;
};

export function CodeFillBlank({
  question,
  codeBefore,
  codeAfter,
  options,
  explanation,
  taskNumber,
  totalTasks,
}: CodeFillBlankProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const correctIndex = options.findIndex((o) => o.correct);
  const isCorrect = selected === correctIndex;

  const handleSelect = useCallback(
    (index: number) => {
      if (submitted && isCorrect) return;
      setSelected(index);
      setSubmitted(false);
    },
    [submitted, isCorrect]
  );

  const handleRun = useCallback(() => {
    if (selected === null) return;
    setSubmitted(true);
  }, [selected]);

  const handleRetry = useCallback(() => {
    setSelected(null);
    setSubmitted(false);
  }, []);

  const progress =
    taskNumber && totalTasks
      ? Math.round(((taskNumber - 1 + (submitted && isCorrect ? 1 : 0)) / totalTasks) * 100)
      : null;

  return (
    <div className="my-8 rounded-2xl border border-white/[0.06] bg-surface-1 overflow-hidden not-prose">
      {/* ─── Top Bar ─── */}
      <div className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.04]">
        {progress !== null && (
          <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {taskNumber && totalTasks && (
          <span className="text-[10px] font-sans tracking-widest text-gray-600 uppercase whitespace-nowrap">
            AI REHBER | Görev {taskNumber}/{totalTasks}
          </span>
        )}
      </div>

      {/* ─── Question ─── */}
      <div className="p-6">
        <h3 className="text-base font-semibold text-gray-100 mb-6 leading-relaxed font-[family-name:var(--font-montserrat)]">
          {question}
        </h3>

        {/* ─── Code block with blank ─── */}
        <div className="bg-surface-0 border border-white/[0.04] rounded-xl p-5 font-sans text-sm leading-relaxed text-gray-300 overflow-x-auto mb-6">
          <span dangerouslySetInnerHTML={{ __html: codeBefore }} />
          <span
            className={cn(
              "inline-block min-w-[80px] text-center px-2 py-0.5 rounded transition-all mx-1",
              selected !== null
                ? "text-primary-400 bg-primary-400/10 border-2 border-transparent"
                : "border-b-2 border-dashed border-gray-600 text-gray-600"
            )}
          >
            {selected !== null ? options[selected].text : "????"}
          </span>
          <span dangerouslySetInnerHTML={{ __html: codeAfter }} />
        </div>

        {/* ─── Options ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((option, i) => {
            const isSelected = selected === i;
            const showCorrect = submitted && i === correctIndex;
            const showWrong = submitted && isSelected && !isCorrect;

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(i)}
                disabled={submitted && isCorrect}
                className={cn(
                  "py-3 px-2 rounded-lg font-sans text-xs sm:text-sm font-medium transition-all border-2",
                  // Default
                  !isSelected && !showCorrect && !showWrong &&
                    "bg-surface-0 border-white/[0.04] text-gray-400 hover:text-gray-200 hover:border-gray-600",
                  // Selected
                  isSelected && !submitted &&
                    "bg-primary-500/10 border-primary-500 text-primary-400",
                  // Correct
                  showCorrect &&
                    "bg-green-500/10 border-green-500 text-green-400",
                  // Wrong
                  showWrong &&
                    "bg-red-500/10 border-red-500 text-red-400",
                  // Disabled
                  submitted && isCorrect && !showCorrect &&
                    "opacity-40 cursor-not-allowed"
                )}
              >
                <span className="flex items-center justify-center gap-1">
                  {showCorrect && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {showWrong && <XCircle className="h-3.5 w-3.5" />}
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Action Bar ─── */}
      <div className="px-6 py-4 bg-surface-0/50 border-t border-white/[0.04]">
        {!submitted ? (
          <button
            type="button"
            onClick={handleRun}
            disabled={selected === null}
            className={cn(
              "w-full py-3 rounded-xl font-bold text-sm transition-all",
              selected !== null
                ? "bg-white text-black hover:bg-gray-200 cursor-pointer"
                : "bg-gray-800 text-gray-600 cursor-not-allowed"
            )}
          >
            KODU ÇALIŞTIR
          </button>
        ) : isCorrect ? (
          <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl animate-fade-up">
            <div>
              <span className="font-semibold text-green-400 text-sm block">
                Doğru!
              </span>
              {explanation && (
                <span className="text-xs text-gray-500 mt-1 block">
                  {explanation}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-fade-up">
            <span className="font-semibold text-red-400 text-sm">
              Hata! Konsolu kontrol et.
            </span>
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white font-bold text-xs rounded-lg hover:bg-red-400 transition-colors shrink-0"
            >
              <RotateCcw className="h-3 w-3" />
              TEKRAR DENE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
