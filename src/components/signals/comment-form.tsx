"use client";

// ─────────────────────────────────────────────────────────────
// feedeep — CommentForm
// Yorum yazma formu — textarea + karakter sayacı + gönder butonu.
// Tek sorumluluk: kullanıcıdan metin al, onSubmit'e ilet.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { cn } from "@/lib/utils";

type CommentFormProps = {
  onSubmit: (text: string) => void;
  placeholder?: string;
  compact?: boolean;
  error?: string;
  onErrorClear?: () => void;
};

export function CommentForm({
  onSubmit,
  placeholder = "Görüşünü yaz...",
  compact = false,
  error,
  onErrorClear,
}: CommentFormProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmed = text.trim();
  const tooShort = text.length > 0 && trimmed.length < 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmed || trimmed.length < 10 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
      setText("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); onErrorClear?.(); }}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        maxLength={1000}
        className={cn(
          "w-full resize-none rounded-lg border border-white/[0.06] bg-surface-1 px-3 py-2 font-sans text-gray-300 placeholder:text-gray-600 focus:border-primary-500/30 focus:outline-none transition-colors",
          compact ? "text-xs" : "text-sm",
        )}
      />
      <div className="flex items-center justify-between">
        <span className={cn("text-[10px] tabular-nums", tooShort ? "text-red-400" : "text-gray-600")}>
          {tooShort ? "En az 10 karakter gerekli" : `${text.length}/1000`}
        </span>
        <button
          type="submit"
          disabled={!trimmed || trimmed.length < 10 || isSubmitting}
          className="text-[11px] font-heading font-semibold tracking-widest uppercase px-3 py-1.5 rounded-md border border-white/[0.08] text-gray-300 hover:text-gray-100 hover:border-primary-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Gönder
        </button>
      </div>
      {error && (
        <p className="text-[11px] text-red-400">{error}</p>
      )}
    </form>
  );
}
